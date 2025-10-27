function PropertiesPanel() {
  return (
    <div className="h-full bg-white border-l border-gray-300 flex flex-col" style={{ width: '280px' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">Properties</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm text-gray-500">
          Select a node to view its properties
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
