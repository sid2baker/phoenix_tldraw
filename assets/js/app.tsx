import { createRoot } from "react-dom/client";
import { Tldraw } from "tldraw";
import { useSync } from "@tldraw/sync";
import "tldraw/tldraw.css";

// Generate or retrieve session ID
const SESSION_ID = "default-session";

function App() {
  const store = useSync({
    uri: `ws://localhost:4000/sync/${SESSION_ID}`,
  });

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw store={store.store} hideUi />
    </div>
  );
}

const container = document.getElementById("app");
if (!container) throw new Error("Failed to find the app element");
const root = createRoot(container);
root.render(<App />);
