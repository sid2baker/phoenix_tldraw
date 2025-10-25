defmodule TldrawWeb.Router do
  use TldrawWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TldrawWeb do
    pipe_through :api
  end
end
