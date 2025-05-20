import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import Console from '../components/Console';
import SnippetsPanel from '../components/SnippetsPanel';
import { executeQ } from '../lib/qInterpreter';
import { useCodeStorage } from '../hooks/useCodeStorage';

const initialCode = `// Create a simple table
trade: ([] 
    date: 2023.10.01 2023.10.01 2023.10.02;
    sym: \`AAPL\`MSFT\`AAPL;
    price: 185.25 402.15 186.40;
    size: 100 200 150
);

// Query the table
select avg price, sum size by sym from trade

// Define a function
calculateVWAP: {[table]
    select vwap: sum[price*size]%sum size by sym from table
};`;

const Editor: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSnippets, setShowSnippets] = useState(!isMobile);
  const { saveSnippet } = useCodeStorage();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setShowSnippets(false);
      else setShowSnippets(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRunCode = (code: string) => {
    setCurrentCode(code);
    setOutput(prev => [...prev, '<div class="text-[#6A9955]">// Executing code...</div>']);
    
    try {
      const result = executeQ(code);
      setOutput(prev => [...prev, ...result]);
      
      // Also save this code snippet
      saveSnippet('main.q', code);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(prev => [...prev, `<div class="text-[#d83b01]">Error: ${error.message}</div>`]);
      } else {
        setOutput(prev => [...prev, `<div class="text-[#d83b01]">Unknown error occurred</div>`]);
      }
    }
  };

  const handleClearConsole = () => {
    setOutput([]);
  };

  const handleLoadSnippet = (code: string) => {
    setCurrentCode(code);
    
    // Dispatch a custom event to load the code into the editor
    const event = new CustomEvent('load-snippet', { detail: { code } });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" id="editor-panel">
      {/* Code Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left sidebar with examples/snippets */}
          {showSnippets && (
            <SnippetsPanel onLoadSnippet={handleLoadSnippet} />
          )}
          
          {!isMobile && !showSnippets && (
            <button 
              className="absolute left-16 top-1/2 z-10 bg-[#333333] p-1 rounded-r"
              onClick={() => setShowSnippets(true)}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          )}
          
          {/* Code editor main area */}
          <CodeEditor 
            onRunCode={handleRunCode}
            initialValue={currentCode}
          />
        </div>
      </div>
      
      {/* Console output area */}
      <Console output={output} onClear={handleClearConsole} />
    </div>
  );
};

export default Editor;
