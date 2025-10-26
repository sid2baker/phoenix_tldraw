defmodule Tldraw.NodesStore do
  @moduledoc """
  Simple GenServer for persisting nodes state across socket reconnects.
  """
  use GenServer

  # Client API

  def start_link(_opts \\ []) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :worker,
      restart: :permanent
    }
  end

  @doc """
  Gets the state for a given topic.
  Returns the stored state or a default state if none exists.
  """
  def get_state(topic) do
    GenServer.call(__MODULE__, {:get_state, topic})
  end

  @doc """
  Updates the state for a given topic.
  """
  def put_state(topic, state) do
    GenServer.cast(__MODULE__, {:put_state, topic, state})
  end

  # Server Callbacks

  @impl true
  def init(_opts) do
    {:ok, %{}}
  end

  @impl true
  def handle_call({:get_state, topic}, _from, state) do
    topic_state = Map.get(state, topic, %{nodes: []})
    {:reply, topic_state, state}
  end

  @impl true
  def handle_cast({:put_state, topic, topic_state}, state) do
    {:noreply, Map.put(state, topic, topic_state)}
  end
end
