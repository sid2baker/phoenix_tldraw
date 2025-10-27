import "./index.css";
import React, { useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Tldraw, Editor, createShapeId } from "tldraw";
import { useSync } from "@tldraw/sync";
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

  const handleMount = useCallback((editor: Editor) => {
    const container = editor.getContainer();

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log("Drop event triggered", e);

      try {
        const data = e.dataTransfer?.getData("text/plain");
        console.log("Drop data:", data);

        if (!data) {
          console.log("No data in drop event");
          return;
        }

        const nodeData = JSON.parse(data);
        console.log("Parsed node data:", nodeData);

        // Convert screen coordinates to canvas coordinates
        const point = editor.screenToPage({ x: e.clientX, y: e.clientY });
        console.log("Drop point:", point);

        // Create shape at drop location
        const shapeId = createShapeId();
        editor.createShape({
          id: shapeId,
          type: "geo",
          x: point.x - 100,
          y: point.y - 50,
          props: {
            geo: "rectangle",
            w: 200,
            h: 100,
          },
        });

        // Select the newly created shape
        editor.select(shapeId);
        console.log("Shape created successfully:", shapeId);
      } catch (error) {
        console.error("Failed to handle drop:", error);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragover", handleDragOver);

    console.log("Drop handlers registered on tldraw container");

    // Cleanup
    return () => {
      container.removeEventListener("drop", handleDrop);
      container.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex">
      <Sidebar />
      <div className="flex-1 relative">
        <Tldraw store={store.store} onMount={handleMount} />
      </div>
    </div>
  );
};

export default App;
