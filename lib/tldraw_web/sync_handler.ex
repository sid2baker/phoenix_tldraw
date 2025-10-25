defmodule TldrawWeb.SyncHandler do
  @moduledoc """
  Direct WebSocket handler for tldraw sync protocol using WebSock.
  """

  @behaviour WebSock

  require Logger

  @protocol_version 7
  @ping_interval 30_000

  @impl WebSock
  def init(opts) do
    room_id = Keyword.get(opts, :room_id, "default")
    room_state = Tldraw.Sync.RoomServer.get_state(room_id)

    state = %{
      room_id: room_id,
      server_clock: room_state.server_clock,
      document: room_state.document,
      schema: nil
    }

    Phoenix.PubSub.subscribe(Tldraw.PubSub, "sync:#{room_id}")
    Process.send_after(self(), :send_ping, @ping_interval)

    {:ok, state}
  end

  @impl WebSock
  def handle_in({text, [opcode: :text]}, state) do
    case Jason.decode(text) do
      {:ok, message} ->
        handle_message(message, state)

      {:error, reason} ->
        Logger.error("Failed to decode message: #{inspect(reason)}")
        {:ok, state}
    end
  end

  def handle_in(_frame, state) do
    {:ok, state}
  end

  @impl WebSock
  def handle_info(:send_ping, state) do
    # Send ping and schedule next one
    Process.send_after(self(), :send_ping, @ping_interval)
    reply = Jason.encode!(%{"type" => "ping"})
    {:push, {:text, reply}, state}
  end

  def handle_info({:patch, diff, server_clock}, state) do
    # Broadcast from other clients
    message = %{
      "type" => "patch",
      "diff" => diff,
      "serverClock" => server_clock
    }

    reply = Jason.encode!(message)
    {:push, {:text, reply}, state}
  end

  def handle_info(_info, state) do
    {:ok, state}
  end

  @impl WebSock
  def terminate(_reason, state) do
    Phoenix.PubSub.unsubscribe(Tldraw.PubSub, "sync:#{state.room_id}")
    :ok
  end

  ## Message Handlers

  defp handle_message(%{"type" => "connect"} = msg, state) do
    connect_request_id = msg["connectRequestId"]
    client_protocol_version = msg["protocolVersion"]
    schema = msg["schema"]

    if client_protocol_version != @protocol_version do
      Logger.warning(
        "Protocol version mismatch: client=#{client_protocol_version}, server=#{@protocol_version}"
      )

      {:stop, :normal, state}
    else
      # Convert document to diff format: { "record-id": ["put", record], ... }
      diff =
        Enum.reduce(state.document, %{}, fn {record_id, record}, acc ->
          Map.put(acc, record_id, ["put", record])
        end)

      response = %{
        "type" => "connect",
        "connectRequestId" => connect_request_id,
        "protocolVersion" => @protocol_version,
        "schema" => schema,
        "hydrationType" => "full",
        "diff" => diff,
        "serverClock" => state.server_clock,
        "isReadonly" => false
      }

      {:push, {:text, Jason.encode!(response)}, %{state | schema: schema}}
    end
  end

  defp handle_message(%{"type" => "push"} = msg, state) do
    client_clock = msg["clientClock"]
    diff = msg["diff"]

    new_server_clock = state.server_clock + 1

    # Get current document from room server and apply diff
    room_state = Tldraw.Sync.RoomServer.get_state(state.room_id)
    new_document = if diff, do: apply_diff(room_state.document, diff), else: room_state.document

    Tldraw.Sync.RoomServer.update_document(state.room_id, new_document, new_server_clock)

    # Broadcast patch to other clients
    if diff do
      Phoenix.PubSub.broadcast(
        Tldraw.PubSub,
        "sync:#{state.room_id}",
        {:patch, diff, new_server_clock}
      )
    end

    response = %{
      "type" => "push_result",
      "clientClock" => client_clock,
      "serverClock" => new_server_clock,
      "action" => "commit"
    }

    {:push, {:text, Jason.encode!(response)},
     %{state | server_clock: new_server_clock, document: new_document}}
  end

  defp handle_message(%{"type" => "ping"}, state) do
    {:push, {:text, Jason.encode!(%{"type" => "pong"})}, state}
  end

  defp handle_message(unknown, state) do
    Logger.warning("Unknown message: #{inspect(unknown)}")
    {:ok, state}
  end

  ## Private Helpers

  defp apply_diff(document, diff) when is_nil(diff), do: document

  defp apply_diff(document, diff) when is_map(diff) do
    # Protocol v7 diff format: { "record-id": ["put", record] | ["patch", changes] | ["remove"] }
    Enum.reduce(diff, document, fn {record_id, operation}, acc ->
      case operation do
        ["put", record] ->
          Map.put(acc, record_id, record)

        ["patch", changes] ->
          existing = Map.get(acc, record_id, %{})
          patched = apply_object_patch(existing, changes)
          Map.put(acc, record_id, patched)

        op when op in [["remove"], ["delete"], "delete"] ->
          Map.delete(acc, record_id)

        _ ->
          Logger.warning("Unknown diff operation for #{record_id}: #{inspect(operation)}")
          acc
      end
    end)
  end

  defp apply_diff(document, _diff), do: document

  # Recursively apply patch operations to an object
  defp apply_object_patch(object, patches) when is_map(patches) and is_map(object) do
    Enum.reduce(patches, object, fn {key, patch_op}, acc ->
      case patch_op do
        ["put", value] ->
          Map.put(acc, key, value)

        ["patch", nested_patches] ->
          existing = Map.get(acc, key, %{})
          patched = apply_object_patch(existing, nested_patches)
          Map.put(acc, key, patched)

        ["append", items, _position] when is_list(items) ->
          existing = Map.get(acc, key, [])
          Map.put(acc, key, existing ++ items)

        ["delete"] ->
          Map.delete(acc, key)

        _ ->
          acc
      end
    end)
  end

  # Handle patching arrays (lists) by index
  defp apply_object_patch(array, patches) when is_list(array) and is_map(patches) do
    Enum.reduce(patches, array, fn {index_str, patch_op}, acc ->
      case Integer.parse(index_str) do
        {index, ""} ->
          # Numeric index - patch array element
          case patch_op do
            ["patch", nested_patches] ->
              # Patch the element at index
              if index < length(acc) do
                element = Enum.at(acc, index)
                patched_element = apply_object_patch(element, nested_patches)
                List.replace_at(acc, index, patched_element)
              else
                acc
              end

            ["put", value] ->
              # Replace element at index
              if index < length(acc) do
                List.replace_at(acc, index, value)
              else
                acc
              end

            _ ->
              acc
          end

        _ ->
          # Not a numeric index, skip
          acc
      end
    end)
  end

  defp apply_object_patch(object, _patches), do: object
end
