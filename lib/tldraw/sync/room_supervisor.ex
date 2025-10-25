defmodule Tldraw.Sync.RoomSupervisor do
  @moduledoc """
  DynamicSupervisor for room servers.
  """

  use DynamicSupervisor

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  def start_room(room_id) do
    spec = {Tldraw.Sync.RoomServer, room_id}
    DynamicSupervisor.start_child(__MODULE__, spec)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end
end
