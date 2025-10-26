defmodule TldrawWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :tldraw

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_tldraw_key",
    signing_salt: "aypXex4e",
    same_site: "Lax"
  ]

  # Serve at "/" the static files from "priv/static" directory.
  #
  # In production, this serves the Vite-built React app.
  # In development, you should run the Vite dev server separately.
  plug Plug.Static,
    at: "/",
    from: :tldraw,
    gzip: false,
    only: ~w(assets js css fonts images favicon.ico robots.txt)

  # Tidewave AI coding agent (only in dev)
  if Code.ensure_loaded?(Tidewave) do
    plug Tidewave
  end

  # LiveState socket for real-time state management
  socket "/live_state", TldrawWeb.LiveStateSocket,
    websocket: [connect_info: [:peer_data, :x_headers]],
    longpoll: false

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  # WebSocket upgrade for tldraw sync (must be before router)
  plug TldrawWeb.Plugs.SyncWebSocketPlug

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug TldrawWeb.Router
end
