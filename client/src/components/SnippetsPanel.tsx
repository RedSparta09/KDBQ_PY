import React, { useState } from 'react';
import { useCodeStorage } from '../hooks/useCodeStorage';

interface SnippetsPanelProps {
  onLoadSnippet: (code: string) => void;
}

const SnippetsPanel: React.FC<SnippetsPanelProps> = ({ onLoadSnippet }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(256); // 64 * 4 = 256px (w-64)
  const { getSavedSnippets } = useCodeStorage();
  const savedSnippets = getSavedSnippets();

  const quickSnippets = [
    {
      name: 'Create Table',
      code: `// Create a simple table
trade: ([] 
    date: 2023.10.01 2023.10.01 2023.10.02;
    sym: \`AAPL\`MSFT\`AAPL;
    price: 185.25 402.15 186.40;
    size: 100 200 150
);`
    },
    {
      name: 'Insert Data',
      code: `// Insert data into a table
\`trade insert (2023.10.03; \`GOOG; 142.50; 300);`
    },
    {
      name: 'Select Query',
      code: `// Basic select query
select from trade where price > 200`
    },
    {
      name: 'Join Tables',
      code: `// Create two tables and join them
employees: ([] id: 1 2 3; name: \`John\`Jane\`Bob; deptId: 101 102 101);
departments: ([] id: 101 102; name: \`IT\`HR);

// Join tables
ej[\`deptId;\`id] employees departments`
    }
  ];

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      
      // Limit min/max width
      if (newWidth > 150 && newWidth < 450) {
        setPanelWidth(newWidth);
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <div 
      className="bg-[#252526] border-r border-[#333333] overflow-y-auto h-full relative"
      style={{ width: `${panelWidth}px` }}
    >
      <div 
        className="resize-handle-vertical"
        onMouseDown={() => setIsResizing(true)}
      ></div>
      <div className="p-4">
        <h2 className="text-md font-semibold mb-3 text-[#0078d4]">My Snippets</h2>
        <div className="space-y-2">
          {savedSnippets.length > 0 ? (
            savedSnippets.map((snippet, index) => (
              <div 
                key={index}
                className="p-2 bg-[#1e1e1e] rounded hover:bg-[#333333] cursor-pointer"
                onClick={() => onLoadSnippet(snippet.content)}
              >
                <h3 className="text-sm font-medium">{snippet.name}</h3>
                <p className="text-xs text-gray-400">Last edited: {formatDate(snippet.timestamp)}</p>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">
              No saved snippets yet. Run code to save it automatically.
            </div>
          )}
        </div>
        
        <h2 className="text-md font-semibold mt-6 mb-3 text-[#0078d4]">Quick Snippets</h2>
        <div className="space-y-2">
          {quickSnippets.map((snippet, index) => (
            <div 
              key={index}
              className="p-2 bg-[#1e1e1e] rounded hover:bg-[#333333] cursor-pointer"
              onClick={() => onLoadSnippet(snippet.code)}
            >
              <h3 className="text-sm font-medium">{snippet.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnippetsPanel;
