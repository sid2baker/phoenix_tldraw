import { useState, useRef, useEffect } from "react";

interface ConsoleProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

function Console({ isMinimized, onToggleMinimize }: ConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Backend console initialized'
    },
    {
      id: '2', 
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      message: 'Connected to workflow engine'
    }
  ]);
  const [input, setInput] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addLog('info', `> ${input}`);
      
      setTimeout(() => {
        if (input.toLowerCase().includes('help')) {
          addLog('info', 'Available commands: status, clear, deploy, test');
        } else if (input.toLowerCase() === 'clear') {
          setLogs([]);
        } else if (input.toLowerCase() === 'status') {
          addLog('success', 'Workflow engine status: Running');
        } else if (input.toLowerCase() === 'deploy') {
          addLog('success', 'Deployment initiated...');
        } else if (input.toLowerCase() === 'test') {
          addLog('warn', 'Running workflow tests...');
          setTimeout(() => addLog('success', 'All tests passed'), 1500);
        } else {
          addLog('error', `Unknown command: ${input}`);
        }
      }, 100);
      
      setInput('');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': 
      default: return 'text-blue-400';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '●';
      case 'warn': return '●';
      case 'success': return '●';
      case 'info':
      default: return '●';
    }
  };

  return (
    <div className={`bg-gray-900 text-white border-t border-gray-700 transition-all duration-300 ${
      isMinimized ? 'h-8' : 'h-64'
    }`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium">Backend Console</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isMinimized && (
            <button
              onClick={clearLogs}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
          
          <button
            onClick={onToggleMinimize}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label={isMinimized ? "Maximize console" : "Minimize console"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMinimized ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 h-40 overflow-y-auto p-2 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Console is empty. Type 'help' to see available commands.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 py-1">
                  <span className="text-xs text-gray-500 mt-0.5">{log.timestamp}</span>
                  <span className={`text-xs mt-0.5 ${getLevelColor(log.level)}`}>{getLevelIcon(log.level)}</span>
                  <span className={`flex-1 ${getLevelColor(log.level)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          <div className="border-t border-gray-700 p-2">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <span className="text-green-400 font-mono">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none font-mono text-sm"
                autoComplete="off"
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default Console;