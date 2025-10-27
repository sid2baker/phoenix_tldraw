import {
  DefaultActionsMenu,
  DefaultQuickActions,
  DefaultStylePanel,
  TLComponents,
  Tldraw,
  TldrawOptions,
  TldrawUiToolbar,
  useEditor,
  useValue,
} from "tldraw";
import { useSync } from "@tldraw/sync";
import { useState, useEffect } from "react";
import Header from "./components/Header.tsx";
import Console from "./components/Console.tsx";
import NodeConfigPanel from "./components/NodeConfigPanel.tsx";
import NodePalette from "./components/NodePalette.tsx";
import PropertiesPanel from "./components/PropertiesPanel.tsx";
import { OnCanvasComponentPicker } from "./components/OnCanvasComponentPicker.tsx";
import { ConnectionBindingUtil } from "./connection/ConnectionBindingUtil";
import { ConnectionShapeUtil } from "./connection/ConnectionShapeUtil";
import { keepConnectionsAtBottom } from "./connection/keepConnectionsAtBottom";
import { disableTransparency } from "./disableTransparency.tsx";
import { NodeShapeUtil } from "./nodes/NodeShapeUtil";
import { PointingPort } from "./ports/PointingPort";
import { SESSION_ID } from "./constants.tsx";

// Build WebSocket URL dynamically for dev and prod
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/sync/${SESSION_ID}`;
};

// Define custom shape utilities that extend tldraw's shape system
const shapeUtils = [NodeShapeUtil, ConnectionShapeUtil];
// Define binding utilities that handle relationships between shapes
const bindingUtils = [ConnectionBindingUtil];

// StylePanel component - only show for non-workflow shapes
function CustomStylePanel() {
  const editor = useEditor();
  const shouldShowStylePanel = useValue(
    "shouldShowStylePanel",
    () => {
      return (
        !editor.isIn("select") ||
        editor
          .getSelectedShapes()
          .some((s) => s.type !== "node" && s.type !== "connection")
      );
    },
    [editor],
  );
  if (!shouldShowStylePanel) return null;
  return <DefaultStylePanel />;
}

// Customize tldraw's UI components to add workflow-specific functionality
const components: TLComponents = {
  InFrontOfTheCanvas: OnCanvasComponentPicker,
  Toolbar: null, // Remove the default toolbar with Select, Hand, Draw tools
  MenuPanel: () => null,
  StylePanel: CustomStylePanel,
};

const options: Partial<TldrawOptions> = {
  actionShortcutsLocation: "menu",
  maxPages: 1,
};

function App() {
  const [isDeployed, setIsDeployed] = useState(false);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [configPanel, setConfigPanel] = useState<{
    isOpen: boolean;
    nodeConfig: any;
  }>({ isOpen: false, nodeConfig: null });
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleToggleDeployment = () => {
    setIsDeployed(!isDeployed);
  };

  const handleToggleConsole = () => {
    setIsConsoleMinimized(!isConsoleMinimized);
  };

  const handleNodeDoubleClick = (event: CustomEvent) => {
    const { nodeId, nodeType, nodeName, nodeProperties } = event.detail;
    setConfigPanel({
      isOpen: true,
      nodeConfig: {
        id: nodeId,
        name: nodeName,
        type: nodeType,
        properties: nodeProperties,
      },
    });
  };

  const handleConfigPanelClose = () => {
    setConfigPanel({ isOpen: false, nodeConfig: null });
  };

  const handleConfigSave = (config: any) => {
    if (!editorInstance) return;

    // Get the shape from the editor
    const shape = editorInstance.getShape(config.id);
    if (!shape || shape.type !== "node") return;

    // Update the node with new configuration
    editorInstance.updateShape({
      id: config.id,
      type: "node",
      props: {
        node: {
          ...shape.props.node,
          name: config.name,
          properties: config.properties,
        },
        isOutOfDate: true,
      },
    });

    setConfigPanel({ isOpen: false, nodeConfig: null });
  };

  // Listen for node double-click events
  useEffect(() => {
    window.addEventListener(
      "nodeDoubleClick",
      handleNodeDoubleClick as EventListener,
    );
    return () => {
      window.removeEventListener(
        "nodeDoubleClick",
        handleNodeDoubleClick as EventListener,
      );
    };
  }, []);

  const store = useSync({
    uri: getWebSocketUrl(),
    shapeUtils: shapeUtils,
    bindingUtils: bindingUtils,
  });

  // Create options that include readOnly state
  const tldrawOptions: Partial<TldrawOptions> = {
    ...options,
    readOnly: isDeployed,
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Header */}
      <Header
        isDeployed={isDeployed}
        onToggleDeployment={handleToggleDeployment}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Canvas and Sidebar Row */}
        <div className="flex-1 flex">
          {/* Node Palette - Left Side (hidden when deployed) */}
          {!isDeployed && <NodePalette onDragStart={() => {}} />}

          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            <Tldraw
              store={store.store}
              persistenceKey="workflow"
              options={tldrawOptions}
              shapeUtils={shapeUtils}
              bindingUtils={bindingUtils}
              components={components}
              onMount={(editor) => {
                // Store editor instance for config updates
                setEditorInstance(editor);

                // Expose editor for debugging
                if (typeof window !== "undefined") {
                  (window as { editor?: typeof editor }).editor = editor;
                }

                // Setup drag and drop from palette
                const container = editor.getContainer();
                let isDropping = false; // Prevent double drop events

                const handleDragOver = (e: DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = "copy";
                  }
                };

                const handleDrop = (e: DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Prevent duplicate drop events
                  if (isDropping) return;
                  isDropping = true;
                  setTimeout(() => {
                    isDropping = false;
                  }, 100);

                  const nodeType = e.dataTransfer?.getData(
                    "application/x-tldraw-node",
                  );
                  if (nodeType !== "process") return;

                  // Get mouse position and convert to page coordinates
                  const point = editor.screenToPage({
                    x: e.clientX,
                    y: e.clientY,
                  });

                  // Get the default node to calculate dimensions
                  const defaultNode = editor
                    .getShapeUtil("node")
                    .getDefaultProps();
                  const nodeHeight = 40 + 4 + 44 + 8; // header + gap + body + padding
                  const nodeWidth = 235;

                  // Create the node centered on cursor
                  editor.createShape({
                    type: "node",
                    x: point.x - nodeWidth / 2,
                    y: point.y - nodeHeight / 2,
                  });
                };

                container.addEventListener("dragover", handleDragOver);
                container.addEventListener("drop", handleDrop);

                // Create initial node if canvas is empty
                if (
                  !editor.getCurrentPageShapes().some((s) => s.type === "node")
                ) {
                  editor.createShape({ type: "node", x: 200, y: 200 });
                }

                // Enable snap mode by default
                editor.user.updateUserPreferences({ isSnapMode: true });

                // Add custom port pointing tool for creating connections
                editor.getStateDescendant("select")!.addChild(PointingPort);

                // Keep connections at the bottom of the shape stack
                keepConnectionsAtBottom(editor);

                // Disable transparency for workflow shapes
                disableTransparency(editor, ["node", "connection"]);
              }}
            />
          </div>

          {/* Properties Panel - Right Side (hidden when deployed) */}
          {!isDeployed && <PropertiesPanel />}
        </div>

        {/* Node Configuration Panel */}
        <NodeConfigPanel
          isOpen={configPanel.isOpen}
          nodeConfig={configPanel.nodeConfig}
          onClose={handleConfigPanelClose}
          onSave={handleConfigSave}
        />

        {/* Console - Bottom */}
        <Console
          isMinimized={isConsoleMinimized}
          onToggleMinimize={handleToggleConsole}
        />
      </div>
    </div>
  );
}

export default App;
