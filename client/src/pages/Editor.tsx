import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import Console from '../components/Console';
import SnippetsPanel from '../components/SnippetsPanel';
import JupyterInterface from '../components/JupyterInterface';
import { executeQ } from '../lib/qInterpreter';
import { executePython } from '../lib/pythonInterpreter';
import { useCodeStorage } from '../hooks/useCodeStorage';

const initialQCode = `// Create a simple table
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

const initialPythonCode = `# Python Example
import math

def calculate_stats(numbers):
    """Calculate basic statistics for a list of numbers"""
    total = sum(numbers)
    count = len(numbers)
    average = total / count
    
    # Calculate standard deviation
    variance = sum((x - average) ** 2 for x in numbers) / count
    std_dev = math.sqrt(variance)
    
    return {
        "count": count,
        "sum": total,
        "average": average,
        "minimum": min(numbers),
        "maximum": max(numbers),
        "std_dev": std_dev
    }

# Test the function
data = [10, 15, 20, 25, 30]
result = calculate_stats(data)

# Print results
for key, value in result.items():
    print(f"{key}: {value}")`;

interface EditorProps {
  language?: 'q' | 'python';
}

const Editor: React.FC<EditorProps> = ({ language = 'q' }) => {
  const initialCode = language === 'q' ? initialQCode : initialPythonCode;
  const [output, setOutput] = useState<string[]>([]);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSnippets, setShowSnippets] = useState(!isMobile);
  const [showJupyter, setShowJupyter] = useState<boolean>(() => {
    // Get from localStorage if available
    const savedPref = localStorage.getItem('jupyter-interface');
    return savedPref === 'true';
  });
  const { saveSnippet } = useCodeStorage();
  const fileExtension = language === 'q' ? '.q' : '.py';

  useEffect(() => {
    // Update current code based on language change
    setCurrentCode(language === 'q' ? initialQCode : initialPythonCode);
    
    // Save Jupyter interface preference
    localStorage.setItem('jupyter-interface', showJupyter.toString());
  }, [language, showJupyter]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setShowSnippets(false);
      else setShowSnippets(true);
    };

    window.addEventListener('resize', handleResize);
    
    // Listen for file upload events
    const handleFileUpload = (e: any) => {
      if (e.detail && e.detail.content && e.detail.fileName) {
        setCurrentCode(e.detail.content);
        
        // Dispatch event to load the file into the editor
        const loadEvent = new CustomEvent('load-snippet', { 
          detail: { code: e.detail.content } 
        });
        window.dispatchEvent(loadEvent);
      }
    };
    
    window.addEventListener('file-upload', handleFileUpload);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('file-upload', handleFileUpload);
    };
  }, []);

  const handleRunCode = async (code: string) => {
    setCurrentCode(code);
    setOutput(prev => [...prev, '<div class="text-[#6A9955]">// Executing code...</div>']);
    
    try {
      let result;
      
      if (language === 'q') {
        // Execute Q code
        result = executeQ(code);
        // Save the snippet
        saveSnippet(`main${fileExtension}`, code);
      } else {
        // Execute Python code
        result = await executePython(code);
        // Save the snippet
        saveSnippet(`main${fileExtension}`, code);
      }
      
      setOutput(prev => [...prev, ...result]);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(prev => [...prev, `<div class="text-[#d83b01]">Error: ${error.message}</div>`]);
      } else {
        setOutput(prev => [...prev, `<div class="text-[#d83b01]">Unknown error occurred</div>`]);
      }
    }
  };
  
  // Add a direct run button in the UI
  const handleRunButtonClick = () => {
    window.dispatchEvent(new Event('run-code'));
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
      {/* Interface selection for Python */}
      {language === 'python' && (
        <div className="bg-[#252526] px-3 py-2 flex space-x-2 border-b border-[#333333]">
          <button 
            className={`px-3 py-1 text-sm rounded ${!showJupyter ? 'bg-[#0078d4] text-white' : 'bg-[#333333] text-gray-300'}`}
            onClick={() => setShowJupyter(false)}
          >
            Standard Editor
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${showJupyter ? 'bg-[#0078d4] text-white' : 'bg-[#333333] text-gray-300'}`}
            onClick={() => setShowJupyter(true)}
          >
            Jupyter Notebook
          </button>
        </div>
      )}
      
      {/* Code Editor Area */}
      {language === 'python' && showJupyter ? (
        <JupyterInterface />
      ) : (
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
            <div className="flex-1 flex flex-col relative">
              <CodeEditor 
                onRunCode={handleRunCode}
                initialValue={currentCode}
                language={language}
              />
              
              {/* Fixed run button */}
              <button 
                className="absolute top-4 right-4 z-10 bg-[#0078d4] hover:bg-[#106ebe] text-white px-4 py-2 rounded flex items-center shadow-lg"
                onClick={handleRunButtonClick}
              >
                <span className="mr-2">▶</span> Run Code (Ctrl+Enter)
              </button>
            </div>
          </div>
          
          {/* Console output area - ensure it's visible */}
          <div className="min-h-[200px]">
            <Console output={output} onClear={handleClearConsole} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
