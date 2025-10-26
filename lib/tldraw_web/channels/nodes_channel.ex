defmodule TldrawWeb.NodesChannel do
  use Phoenix.Channel
  require Logger

  alias Tldraw.NodesStore

  @impl true
  def join("nodes:" <> topic, _params, socket) do
    # Load existing state from store
    state = NodesStore.get_state(topic)
    send(self(), :after_join)
    {:ok, socket |> assign(:topic, topic) |> assign(:state, state)}
  end

  @impl true
  def handle_info(:after_join, socket) do
    push(socket, "state:change", %{state: socket.assigns.state, version: 0})
    {:noreply, socket}
  end

  @impl true
  def handle_in("lvs_evt:" <> event, payload, socket) do
    Logger.debug("Received event: #{event} with payload: #{inspect(payload)}")

    # Get the latest state from store (not from stale socket.assigns.state)
    current_state = NodesStore.get_state(socket.assigns.topic)
    new_state = handle_event(event, payload, current_state)

    # Persist updated state to store
    NodesStore.put_state(socket.assigns.topic, new_state)

    socket = assign(socket, :state, new_state)
    broadcast!(socket, "state:change", %{state: new_state, version: 0})
    {:noreply, socket}
  end

  defp handle_event("add_node", %{"node" => node}, state) do
    new_nodes = [node | state.nodes]
    %{state | nodes: new_nodes}
  end

  defp handle_event("remove_node", %{"id" => id}, state) do
    new_nodes = Enum.reject(state.nodes, fn node -> node["id"] == id end)
    %{state | nodes: new_nodes}
  end

  defp handle_event("update_node", %{"id" => id, "node" => updated_node}, state) do
    new_nodes =
      Enum.map(state.nodes, fn node ->
        if node["id"] == id, do: Map.merge(node, updated_node), else: node
      end)

    %{state | nodes: new_nodes}
  end

  defp handle_event(_event, _detail, state), do: state
end
