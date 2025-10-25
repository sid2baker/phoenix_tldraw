defmodule TldrawWeb.Plugs.ServeSPA do
  @moduledoc """
  Serves the SPA's index.html for all routes.
  This allows the client-side router to handle routing.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    index_path = Application.app_dir(:tldraw, "priv/static/index.html")

    case File.read(index_path) do
      {:ok, content} ->
        conn
        |> put_resp_content_type("text/html")
        |> send_resp(200, content)

      {:error, _} ->
        conn
        |> put_resp_content_type("text/html")
        |> send_resp(404, "<h1>404 - index.html not found</h1><p>Run your Vite build first.</p>")
    end
  end
end
