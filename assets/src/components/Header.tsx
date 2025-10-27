import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  isDeployed: boolean;
  onToggleDeployment: () => void;
}

function Header({ isDeployed, onToggleDeployment }: HeaderProps) {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleSettingsItemClick = (item: string) => {
    console.log(`Settings item clicked: ${item}`);
    setShowSettingsDropdown(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">Workflow Editor</h1>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center space-x-3">
        {/* Deploy/Edit Button */}
        <button
          onClick={onToggleDeployment}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isDeployed
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isDeployed ? "Edit" : "Deploy"}
        </button>

        {/* Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleSettingsClick}
            className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Settings"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showSettingsDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <button
                  onClick={() => handleSettingsItemClick("export")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export Workflow
                </button>
                <button
                  onClick={() => handleSettingsItemClick("import")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Import Workflow
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => handleSettingsItemClick("preferences")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Preferences
                </button>
                <button
                  onClick={() => handleSettingsItemClick("help")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Help & Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-3 right-20">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isDeployed
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isDeployed ? "Deployed" : "Draft"}
        </div>
      </div>
    </header>
  );
}

export default Header;