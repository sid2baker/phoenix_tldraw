defmodule TldrawWeb.PageController do
  use Phoenix.Controller

  @moduledoc """
  Serves the React SPA index.html for client-side routing.
  """

  def index(conn, _params) do
    conn
    |> put_resp_header("content-type", "text/html; charset=utf-8")
    |> Plug.Conn.send_file(200, static_path("index.html"))
  end

  defp static_path(file) do
    Path.join(Application.app_dir(:tldraw, "priv/static"), file)
  end
end
