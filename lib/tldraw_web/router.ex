defmodule TldrawWeb.Router do
  use Phoenix.Router

  import Plug.Conn

  # Serve the SPA for all routes - client-side router handles navigation
  get "/*path", TldrawWeb.Plugs.ServeSPA, []
end
