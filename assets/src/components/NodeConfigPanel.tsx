import { useState } from "react";

interface NodeConfig {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

interface NodeConfigPanelProps {
  isOpen: boolean;
  nodeConfig: NodeConfig | null;
  onClose: () => void;
  onSave: (config: NodeConfig) => void;
}

function NodeConfigPanel({
  isOpen,
  nodeConfig,
  onClose,
  onSave,
}: NodeConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<NodeConfig | null>(nodeConfig);

  const updateProperty = (key: string, value: any) => {
    if (localConfig) {
      setLocalConfig({
        ...localConfig,
        properties: {
          ...localConfig.properties,
          [key]: value,
        },
      });
    }
  };

  const handleSave = () => {
    if (localConfig) {
      onSave(localConfig);
    }
  };

  const handleCancel = () => {
    setLocalConfig(nodeConfig);
    onClose();
  };

  const renderConfigForm = () => {
    if (!localConfig) return null;

    switch (localConfig.type) {
      case "process":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Outputs
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={localConfig.properties.outputCount || 2}
                onChange={(e) =>
                  updateProperty("outputCount", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={localConfig.properties.description || ""}
                onChange={(e) => updateProperty("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter node description..."
              />
            </div>
          </div>
        );

      case "conditional":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Type
              </label>
              <select
                value={localConfig.properties.condition || "is equal to"}
                onChange={(e) => updateProperty("condition", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="is equal to">is equal to</option>
                <option value="is not equal to">is not equal to</option>
                <option value="is greater than">is greater than</option>
                <option value="is less than">is less than</option>
                <option value="is greater than or equal to">
                  is greater than or equal to
                </option>
                <option value="is less than or equal to">
                  is less than or equal to
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Value
              </label>
              <input
                type="number"
                value={localConfig.properties.compareValue || 0}
                onChange={(e) =>
                  updateProperty("compareValue", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={localConfig.properties.min || 0}
                onChange={(e) =>
                  updateProperty("min", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={localConfig.properties.max || 100}
                onChange={(e) =>
                  updateProperty("max", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="number"
                value={localConfig.properties.defaultValue || 50}
                onChange={(e) =>
                  updateProperty("defaultValue", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Size
              </label>
              <input
                type="number"
                value={localConfig.properties.step || 1}
                onChange={(e) =>
                  updateProperty("step", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white border-l border-gray-300 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "400px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Configure Node
          </h2>
          <p className="text-sm text-gray-600">
            {localConfig?.type.charAt(0).toUpperCase() +
              localConfig?.type.slice(1)}{" "}
            Node
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-md transition-colors"
          aria-label="Close configuration panel"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">{renderConfigForm()}</div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default NodeConfigPanel;
