defmodule TldrawWeb.Router do
  @moduledoc """
  Router for the tldraw application.

  The frontend is served via:
  - Development: Run Vite dev server on :5173 separately (`npm run dev`)
  - Production: Plug.Static serves built files from priv/static/

  This router handles API endpoints, WebSocket connections, and SPA fallback.
  """

  use Phoenix.Router

  import Plug.Conn
  import Phoenix.Controller

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :put_secure_browser_headers
  end

  # Add API routes here as needed
  # scope "/api" do
  #   pipe_through :api
  # end

  # Catch-all route for SPA client-side routing
  # This must be last to allow other routes to match first
  scope "/", TldrawWeb do
    pipe_through :browser

    get "/*path", PageController, :index
  end
end
