import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useCodeStorage } from '../hooks/useCodeStorage';

interface EditorProps {
  onRunCode: (code: string) => void;
  initialValue?: string;
}

const CodeEditor: React.FC<EditorProps> = ({ onRunCode, initialValue }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { saveCode, getLastCode } = useCodeStorage();
  const [activeTab, setActiveTab] = useState('main.q');
  const [tabs, setTabs] = useState([{ name: 'main.q', content: initialValue || '' }]);

  useEffect(() => {
    if (editorRef.current) {
      const lastCode = getLastCode(activeTab) || initialValue || '';
      
      const ed = monaco.editor.create(editorRef.current, {
        value: lastCode,
        language: 'q',
        theme: 'qTheme',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        renderWhitespace: 'none',
        tabSize: 2,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace'
      });

      setEditor(ed);

      // Listen for run code event
      const runHandler = () => {
        if (ed) {
          const code = ed.getValue();
          saveCode(activeTab, code);
          onRunCode(code);
        }
      };

      window.addEventListener('run-code', runHandler);

      return () => {
        ed.dispose();
        window.removeEventListener('run-code', runHandler);
      };
    }
  }, [activeTab, onRunCode, saveCode, getLastCode, initialValue]);

  // Save code when content changes
  useEffect(() => {
    if (editor) {
      const disposable = editor.onDidChangeModelContent(() => {
        saveCode(activeTab, editor.getValue());
      });

      return () => disposable.dispose();
    }
  }, [editor, activeTab, saveCode]);

  const handleAddTab = () => {
    const newTabName = `code${tabs.length + 1}.q`;
    setTabs([...tabs, { name: newTabName, content: '' }]);
    setActiveTab(newTabName);
  };

  const handleTabClose = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.name !== name);
      setTabs(newTabs);
      if (activeTab === name) {
        setActiveTab(newTabs[0].name);
      }
    }
  };

  const handleTabClick = (name: string) => {
    if (activeTab !== name) {
      if (editor) {
        // Save current content
        const currentTabIndex = tabs.findIndex(tab => tab.name === activeTab);
        if (currentTabIndex >= 0) {
          const updatedTabs = [...tabs];
          updatedTabs[currentTabIndex].content = editor.getValue();
          setTabs(updatedTabs);
        }
        
        // Load new tab content
        const newTab = tabs.find(tab => tab.name === name);
        const content = newTab ? newTab.content : getLastCode(name) || '';
        editor.setValue(content);
        setActiveTab(name);
      }
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Tabs for open files */}
      <div className="bg-[#1e1e1e] border-b border-[#333333] flex">
        {tabs.map(tab => (
          <div 
            key={tab.name}
            className={`px-4 py-2 text-sm flex items-center border-r border-[#333333] cursor-pointer ${activeTab === tab.name ? 'bg-[#252526] text-white' : 'text-gray-400'}`}
            onClick={() => handleTabClick(tab.name)}
          >
            <span>{tab.name}</span>
            <button 
              className="ml-2 text-gray-500 hover:text-white"
              onClick={(e) => handleTabClose(tab.name, e)}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          onClick={handleAddTab}
        >
          <i className="ri-add-line"></i>
        </button>
      </div>
      
      {/* Code editor */}
      <div className="flex-1 overflow-hidden" ref={editorRef}></div>
    </div>
  );
};

export default CodeEditor;
