import { useState } from "react";

interface NodePaletteProps {
  onDragStart: () => void;
}

function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div
      className="h-full bg-white border-r border-gray-300 flex flex-col"
      style={{ width: "240px" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">Nodes</h2>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/x-tldraw-node", "process");
            e.dataTransfer.effectAllowed = "copy";
            onDragStart();
          }}
          className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing group"
        >
          <div className="flex-shrink-0 w-10 h-10 mr-3 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl group-hover:bg-blue-200 transition-colors">
            ⚙️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm">Process</div>
            <div className="text-xs text-gray-500">General purpose node</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NodePalette;
