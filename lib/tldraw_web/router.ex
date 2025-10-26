defmodule TldrawWeb.Router do
  @moduledoc """
  Router for local development of this library.

  When this library is used as a dependency, parent apps should add routes like:

      # In parent app's router.ex
      scope "/drawing" do
        get "/", TldrawWeb.TldrawController, :index
      end
  """

  use Phoenix.Router

  import Plug.Conn
  import Phoenix.Controller

  # For local development/testing of this library
  get "/", TldrawWeb.TldrawController, :index
end
