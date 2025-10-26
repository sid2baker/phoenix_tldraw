defmodule TldrawWeb.TldrawController do
  @moduledoc """
  Serves the tldraw SPA HTML shell.

  Parent apps should add this to their router:

      scope "/drawing" do
        get "/", TldrawWeb.TldrawController, :index
      end
  """

  use Phoenix.Controller
  alias TldrawWeb.Vite

  def index(conn, _params) do
    conn
    |> put_resp_content_type("text/html")
    |> send_resp(200, Vite.render_html_shell())
  end
end
