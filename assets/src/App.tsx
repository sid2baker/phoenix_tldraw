import {
  DefaultActionsMenu,
  DefaultQuickActions,
  DefaultStylePanel,
  defaultShapeUtils,
  defaultBindingUtils,
  TLComponents,
  Tldraw,
  TldrawOptions,
  TldrawUiToolbar,
  useEditor,
  useValue,
} from "tldraw";
import { useSync } from "@tldraw/sync";
import Sidebar from "./components/Sidebar.tsx";
import { OnCanvasComponentPicker } from "./components/OnCanvasComponentPicker.tsx";
import { WorkflowRegions } from "./components/WorkflowRegions.tsx";
import { overrides, WorkflowToolbar } from "./components/WorkflowToolbar.tsx";
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
const customShapeUtils = [...defaultShapeUtils, ...shapeUtils];
// Define binding utilities that handle relationships between shapes
const bindingUtils = [ConnectionBindingUtil];
const customBindingUtils = [...defaultBindingUtils, ...bindingUtils];

// Customize tldraw's UI components to add workflow-specific functionality
const components: TLComponents = {
  InFrontOfTheCanvas: () => (
    <>
      <OnCanvasComponentPicker />
      <WorkflowRegions />
    </>
  ),
  Toolbar: () => (
    <>
      <WorkflowToolbar />
      <div className="tlui-main-toolbar tlui-main-toolbar--horizontal">
        <TldrawUiToolbar className="tlui-main-toolbar__tools" label="Actions">
          <DefaultQuickActions />
          <DefaultActionsMenu />
        </TldrawUiToolbar>
      </div>
    </>
  ),

  MenuPanel: () => null,
  StylePanel: () => {
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
    if (!shouldShowStylePanel) return;
    return <DefaultStylePanel />;
  },
};

const options: Partial<TldrawOptions> = {
  actionShortcutsLocation: "menu",
  maxPages: 1,
};

function App() {
  const store = useSync({
    uri: getWebSocketUrl(),
    shapeUtils: customShapeUtils,
    bindingUtils: bindingUtils,
  });

  return (
    <div className="fixed inset-0 flex">
      <Sidebar />
      <div className="flex-1 relative">
        <Tldraw
          store={store.store}
          persistenceKey="workflow"
          options={options}
          overrides={overrides}
          shapeUtils={shapeUtils}
          bindingUtils={bindingUtils}
          components={components}
          onMount={(editor) => {
            (window as any).editor = editor;
            if (!editor.getCurrentPageShapes().some((s) => s.type === "node")) {
              editor.createShape({ type: "node", x: 200, y: 200 });
            }

            editor.user.updateUserPreferences({ isSnapMode: true });

            // Add our custom pointing port tool to the select tool's state machine
            // This allows users to create connections by pointing at ports
            editor.getStateDescendant("select")!.addChild(PointingPort);

            // Ensure connections always stay at the bottom of the shape stack
            // This prevents them from covering other shapes
            keepConnectionsAtBottom(editor);

            // Disable transparency for workflow shapes
            disableTransparency(editor, ["node", "connection"]);
          }}
        />
      </div>
    </div>
  );
}

export default App;
