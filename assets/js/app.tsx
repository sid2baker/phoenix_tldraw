import React from "react";
import { createRoot } from "react-dom/client";
import { Tldraw } from "tldraw";
import { useSync } from "@tldraw/sync";
import "tldraw/tldraw.css";
import "./app.css";
import Sidebar from "./components/Sidebar";

// Generate or retrieve session ID
const SESSION_ID = "default-session";

// Build WebSocket URL dynamically for dev and prod
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/sync/${SESSION_ID}`;
};

const App = () => {
  const store = useSync({
    uri: getWebSocketUrl(),
  });

  return (
    <div className="fixed inset-0 flex">
      <Sidebar />
      <div className="flex-1 relative">
        <Tldraw store={store.store} />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
