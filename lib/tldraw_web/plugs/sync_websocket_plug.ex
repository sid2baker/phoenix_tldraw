defmodule TldrawWeb.Plugs.SyncWebSocketPlug do
  @moduledoc """
  Plug that intercepts /sync/* requests and upgrades them to WebSocket connections.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(%Plug.Conn{path_info: ["sync", room_id | _]} = conn, _opts) do
    # Check if this is a WebSocket upgrade request
    case get_req_header(conn, "upgrade") do
      [upgrade | _] when upgrade in ["websocket", "WebSocket"] ->
        # Upgrade to WebSocket using WebSockAdapter
        conn
        |> WebSockAdapter.upgrade(TldrawWeb.SyncHandler, [room_id: room_id], [])
        |> halt()

      _ ->
        conn
    end
  end

  def call(conn, _opts), do: conn
end
