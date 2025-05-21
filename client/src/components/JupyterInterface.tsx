import React, { useEffect, useRef, useState } from 'react';
import { executePython } from '../lib/pythonInterpreter';

type CellType = 'code' | 'markdown';

interface Cell {
  id: string;
  type: CellType;
  content: string;
  output: string[];
  isExecuting: boolean;
}

const JupyterInterface: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([
    {
      id: 'cell-1',
      type: 'code',
      content: '# Welcome to Jupyter-like interface\n# Enter Python code here and click Run Cell\nprint("Hello, world!")',
      output: [],
      isExecuting: false
    }
  ]);
  
  const [activeCell, setActiveCell] = useState<string>('cell-1');
  const cellRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    // Focus the active cell when it changes
    if (activeCell && cellRefs.current[activeCell]) {
      cellRefs.current[activeCell]?.focus();
    }
  }, [activeCell]);

  const generateCellId = (): string => {
    return `cell-${Date.now()}`;
  };

  const handleCellContentChange = (id: string, content: string) => {
    setCells(prev => 
      prev.map(cell => 
        cell.id === id ? { ...cell, content } : cell
      )
    );
  };

  const handleCellTypeChange = (id: string, type: CellType) => {
    setCells(prev => 
      prev.map(cell => 
        cell.id === id ? { ...cell, type } : cell
      )
    );
  };

  const executeCell = async (id: string) => {
    // Find the cell
    const cellIndex = cells.findIndex(cell => cell.id === id);
    if (cellIndex === -1 || cells[cellIndex].type !== 'code') return;

    // Mark cell as executing
    setCells(prev => 
      prev.map(cell => 
        cell.id === id ? { ...cell, isExecuting: true, output: [] } : cell
      )
    );

    try {
      // Execute the code
      const result = await executePython(cells[cellIndex].content);
      
      // Update cell with output
      setCells(prev => 
        prev.map(cell => 
          cell.id === id ? { ...cell, isExecuting: false, output: result } : cell
        )
      );
    } catch (error) {
      // Handle error
      setCells(prev => 
        prev.map(cell => 
          cell.id === id ? { 
            ...cell, 
            isExecuting: false, 
            output: [`<div class="text-[#d83b01]">Error: ${error instanceof Error ? error.message : 'Unknown error'}</div>`] 
          } : cell
        )
      );
    }
  };

  const addCell = (index: number, type: CellType = 'code') => {
    const newCellId = generateCellId();
    const newCell: Cell = {
      id: newCellId,
      type,
      content: '',
      output: [],
      isExecuting: false
    };
    
    setCells(prev => {
      const updatedCells = [...prev];
      updatedCells.splice(index + 1, 0, newCell);
      return updatedCells;
    });
    
    // Set the new cell as active
    setActiveCell(newCellId);
  };

  const deleteCell = (id: string) => {
    setCells(prev => {
      if (prev.length <= 1) return prev; // Don't delete the last cell
      return prev.filter(cell => cell.id !== id);
    });
  };

  const moveCellUp = (id: string) => {
    setCells(prev => {
      const index = prev.findIndex(cell => cell.id === id);
      if (index <= 0) return prev;
      
      const updatedCells = [...prev];
      const temp = updatedCells[index];
      updatedCells[index] = updatedCells[index - 1];
      updatedCells[index - 1] = temp;
      
      return updatedCells;
    });
  };

  const moveCellDown = (id: string) => {
    setCells(prev => {
      const index = prev.findIndex(cell => cell.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      
      const updatedCells = [...prev];
      const temp = updatedCells[index];
      updatedCells[index] = updatedCells[index + 1];
      updatedCells[index + 1] = temp;
      
      return updatedCells;
    });
  };

  const executeAllCells = async () => {
    for (const cell of cells) {
      if (cell.type === 'code') {
        await executeCell(cell.id);
      }
    }
  };

  const renderMarkdown = (content: string): string => {
    // Very simple markdown renderer (this would be better with a proper markdown library)
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-md font-bold mb-1">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-[#333333] px-1 rounded">$1</code>')
      .replace(/^\s*\n/gm, '<br>')
      .replace(/^- (.+)$/gm, '<li class="list-disc ml-4">$1</li>');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#1e1e1e]">
      {/* Notebook toolbar */}
      <div className="mb-4 flex items-center space-x-2">
        <button 
          className="px-3 py-1 bg-[#107c10] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={executeAllCells}
        >
          <i className="ri-play-fill mr-1"></i> Run All
        </button>
        <button 
          className="px-3 py-1 bg-[#0078d4] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={() => addCell(cells.length - 1, 'code')}
        >
          <i className="ri-add-line mr-1"></i> Add Code Cell
        </button>
        <button 
          className="px-3 py-1 bg-[#0078d4] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={() => addCell(cells.length - 1, 'markdown')}
        >
          <i className="ri-text-wrap mr-1"></i> Add Markdown Cell
        </button>
        <div className="flex-1"></div>
        <button
          className="px-3 py-1 bg-[#333333] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={() => {
            if (confirm('Are you sure you want to clear all cells?')) {
              setCells([{
                id: generateCellId(),
                type: 'code',
                content: '',
                output: [],
                isExecuting: false
              }]);
            }
          }}
        >
          <i className="ri-delete-bin-line mr-1"></i> Clear Notebook
        </button>
      </div>

      {/* Cells */}
      <div className="space-y-4">
        {cells.map((cell, index) => (
          <div 
            key={cell.id} 
            className={`border ${activeCell === cell.id ? 'border-[#0078d4]' : 'border-[#333333]'} rounded-lg overflow-hidden`}
            onClick={() => setActiveCell(cell.id)}
          >
            {/* Cell toolbar */}
            <div className="flex items-center space-x-2 bg-[#252526] px-3 py-1 border-b border-[#333333]">
              <span className="text-xs text-gray-400">Cell {index + 1}</span>
              
              <select
                className="ml-2 bg-[#333333] text-white text-xs rounded px-2 py-1 border border-[#555555]"
                value={cell.type}
                onChange={(e) => handleCellTypeChange(cell.id, e.target.value as CellType)}
              >
                <option value="code">Code</option>
                <option value="markdown">Markdown</option>
              </select>
              
              <div className="flex-1"></div>
              
              {cell.type === 'code' && (
                <button
                  className={`px-2 py-1 ${cell.isExecuting ? 'bg-[#555555]' : 'bg-[#107c10]'} text-white rounded text-xs flex items-center hover:bg-opacity-90`}
                  onClick={() => executeCell(cell.id)}
                  disabled={cell.isExecuting}
                >
                  {cell.isExecuting ? (
                    <>Running <i className="ri-loader-4-line ml-1 animate-spin"></i></>
                  ) : (
                    <>Run <i className="ri-play-fill ml-1"></i></>
                  )}
                </button>
              )}
              
              <button
                className="p-1 text-gray-400 hover:text-white"
                onClick={() => moveCellUp(cell.id)}
                disabled={index === 0}
              >
                <i className="ri-arrow-up-s-line"></i>
              </button>
              
              <button
                className="p-1 text-gray-400 hover:text-white"
                onClick={() => moveCellDown(cell.id)}
                disabled={index === cells.length - 1}
              >
                <i className="ri-arrow-down-s-line"></i>
              </button>
              
              <button
                className="p-1 text-gray-400 hover:text-white"
                onClick={() => deleteCell(cell.id)}
                disabled={cells.length <= 1}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
            
            {/* Cell content */}
            <div className="bg-[#1e1e1e]">
              {cell.type === 'markdown' && activeCell !== cell.id ? (
                // Rendered markdown when not active
                <div 
                  className="p-3 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.content) }}
                  onClick={() => setActiveCell(cell.id)}
                ></div>
              ) : (
                // Editor
                <textarea
                  ref={el => cellRefs.current[cell.id] = el}
                  className="w-full bg-[#1e1e1e] text-white p-3 focus:outline-none font-mono"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={cell.content}
                  onChange={(e) => handleCellContentChange(cell.id, e.target.value)}
                  placeholder={cell.type === 'code' ? '# Enter Python code' : '# Enter Markdown'}
                  spellCheck={false}
                ></textarea>
              )}
              
              {/* Cell output (for code cells) */}
              {cell.type === 'code' && cell.output.length > 0 && (
                <div className="border-t border-[#333333] p-3 bg-[#252526]">
                  {cell.output.map((output, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: output }}></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add cell button at the end */}
      <div className="mt-4 flex justify-center">
        <button
          className="px-3 py-1 bg-[#333333] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={() => addCell(cells.length - 1)}
        >
          <i className="ri-add-line mr-1"></i> Add Cell
        </button>
      </div>
    </div>
  );
};

export default JupyterInterface;