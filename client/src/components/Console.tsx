import React, { useState, useEffect, useRef } from 'react';

interface ConsoleProps {
  output: string[];
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ output, onClear }) => {
  const [activeTab, setActiveTab] = useState<'output' | 'variables' | 'history'>('output');
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !consoleRef.current) return;
      
      const consoleRect = consoleRef.current.parentElement?.getBoundingClientRect();
      if (!consoleRect) return;
      
      const newHeight = consoleRect.bottom - e.clientY;
      
      if (newHeight > 100 && newHeight < window.innerHeight - 200) {
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    const handleClearConsole = () => onClear();
    window.addEventListener('clear-console', handleClearConsole);
    
    return () => {
      window.removeEventListener('clear-console', handleClearConsole);
    };
  }, [onClear]);

  return (
    <div 
      ref={consoleRef}
      className="border-t border-[#333333] relative flex flex-col bg-[#1e1e1e]"
      style={{ height: `${consoleHeight}px` }}
    >
      <div 
        className="resize-handle" 
        onMouseDown={() => setIsResizing(true)}
      ></div>
      
      {/* Console header with tabs */}
      <div className="flex items-center px-4 py-1 border-b border-[#333333]">
        <h3 className="text-sm font-medium mr-4">Console</h3>
        <div className="flex text-xs">
          <button 
            className={`px-3 py-1 ${activeTab === 'output' ? 'bg-[#252526] text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
          <button 
            className={`px-3 py-1 ${activeTab === 'variables' ? 'bg-[#252526] text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('variables')}
          >
            Variables
          </button>
          <button 
            className={`px-3 py-1 ${activeTab === 'history' ? 'bg-[#252526] text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
        <div className="ml-auto">
          <button 
            className="p-1 text-gray-400 hover:text-white"
            onClick={onClear}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      
      {/* Console content */}
      <div 
        ref={contentRef}
        className="flex-1 p-3 font-mono text-sm overflow-auto bg-[#1e1e1e]"
      >
        {activeTab === 'output' && output.map((line, index) => (
          <pre key={index} className="whitespace-pre-wrap mb-1">
            <span dangerouslySetInnerHTML={{ __html: line }} />
          </pre>
        ))}
        
        {activeTab === 'variables' && (
          <div className="text-gray-400">Variables view will show defined symbols and their values</div>
        )}
        
        {activeTab === 'history' && (
          <div className="text-gray-400">Command history will show previously executed commands</div>
        )}
      </div>
    </div>
  );
};

export default Console;
