defmodule Tldraw.Sync.RoomServer do
  @moduledoc """
  GenServer that maintains the state for a single sync room.
  """

  use GenServer
  require Logger

  ## Client API

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id, name: via_tuple(room_id))
  end

  def get_state(room_id) do
    # Ensure room is started
    ensure_started(room_id)
    GenServer.call(via_tuple(room_id), :get_state)
  end

  def update_document(room_id, document, server_clock) do
    GenServer.call(via_tuple(room_id), {:update_document, document, server_clock})
  end

  ## Server Callbacks

  @impl true
  def init(room_id) do
    state = %{
      room_id: room_id,
      document: %{},
      server_clock: 0
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:update_document, document, server_clock}, _from, state) do
    new_state = %{state | document: document, server_clock: server_clock}
    {:reply, :ok, new_state}
  end

  ## Private Functions

  defp ensure_started(room_id) do
    case Tldraw.Sync.RoomSupervisor.start_room(room_id) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      error -> error
    end
  end

  defp via_tuple(room_id) do
    {:via, Registry, {Tldraw.Sync.RoomRegistry, room_id}}
  end
end
