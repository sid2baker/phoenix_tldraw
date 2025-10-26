defmodule TldrawWeb.Vite do
  @moduledoc """
  Helper for Vite asset paths in the tldraw library.

  Development (this library): Assets served from Vite dev server (localhost:5173).
  Production (as dependency): Assets served from /tldraw/ namespace.
  """

  @vite_dev_server "http://localhost:5173"
  @asset_namespace "/tldraw"

  @doc """
  Returns the full URL/path for a Vite asset.

  ## Examples

      # When developing this library (Mix.env() == :dev)
      TldrawWeb.Vite.asset_path("js/app.tsx")
      # => "http://localhost:5173/js/app.tsx"

      # When used as dependency in parent app (Mix.env() == :prod)
      TldrawWeb.Vite.asset_path("js/app.js")
      # => "/tldraw/js/app.js"
  """
  def asset_path(path) do
    path = String.trim_leading(path, "/")

    if dev?() do
      "#{@vite_dev_server}/#{path}"
    else
      "#{@asset_namespace}/#{path}"
    end
  end

  @doc """
  Returns the Vite client script URL (only in dev for HMR).
  """
  def vite_client_url do
    if dev?() do
      "#{@vite_dev_server}/@vite/client"
    else
      nil
    end
  end

  @doc """
  Renders the tldraw HTML shell with environment-appropriate asset paths.
  """
  def render_html_shell do
    vite_client_tag =
      if url = vite_client_url() do
        ~s(<script type="module" src="#{url}"></script>)
      else
        ""
      end

    # In dev, load .tsx source; in prod, load compiled .js
    app_script = if dev?(), do: "js/app.tsx", else: "js/app.js"

    """
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tldraw</title>
        #{vite_client_tag}
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="#{asset_path(app_script)}"></script>
      </body>
    </html>
    """
  end

  defp dev?, do: Application.get_env(:tldraw, :env) == :dev || Mix.env() == :dev
end
