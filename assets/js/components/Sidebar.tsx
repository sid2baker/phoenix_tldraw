import { useState } from "react";
import useLiveState from "use-live-state/useLiveState";
import { nodesLiveState } from "../liveState";

interface Node {
  id: string;
  name: string;
  type: string;
}

interface NodesState {
  nodes: Node[];
}

function Sidebar() {
  const [state, pushEvent] = useLiveState<NodesState>(nodesLiveState, {
    nodes: [],
  });
  const [newNodeName, setNewNodeName] = useState("");

  const handleAddNode = () => {
    if (newNodeName.trim()) {
      const newNode = {
        id: crypto.randomUUID(),
        name: newNodeName,
        type: "default",
      };
      pushEvent("add_node", { node: newNode });
      setNewNodeName("");
    }
  };

  const handleRemoveNode = (id: string) => {
    pushEvent("remove_node", { id });
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Nodes</h2>
      </div>

      {/* Add Node Form */}
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddNode()}
          placeholder="Node name..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
        />
        <button
          onClick={handleAddNode}
          className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
        >
          Add Node
        </button>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.nodes && state.nodes.length > 0 ? (
          <ul className="space-y-2">
            {state.nodes.map((node) => (
              <li
                key={node.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{node.name}</div>
                  <div className="text-xs text-gray-400">{node.type}</div>
                </div>
                <button
                  onClick={() => handleRemoveNode(node.id)}
                  className="ml-2 px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  title="Remove node"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No nodes yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
