import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useCodeStorage } from '../hooks/useCodeStorage';

interface EditorProps {
  onRunCode: (code: string) => void;
  initialValue?: string;
  language?: 'q' | 'python';
}

const CodeEditor: React.FC<EditorProps> = ({ onRunCode, initialValue, language = 'q' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { saveCode, getLastCode } = useCodeStorage();
  const fileExtension = language === 'q' ? '.q' : '.py';
  const [activeTab, setActiveTab] = useState(`main${fileExtension}`);
  const [tabs, setTabs] = useState([{ name: `main${fileExtension}`, content: initialValue || '' }]);

  // Initialize editor when component mounts
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const lastCode = getLastCode(activeTab) || initialValue || '';
      
      const ed = monaco.editor.create(editorRef.current, {
        value: lastCode,
        language: language,
        theme: language === 'q' ? 'qTheme' : 'vs-dark',
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

      editorInstanceRef.current = ed;
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

      // Listen for loading snippets
      const loadSnippetHandler = (e: any) => {
        if (ed && e.detail && e.detail.code) {
          ed.setValue(e.detail.code);
        }
      };
      
      window.addEventListener('load-snippet', loadSnippetHandler);

      return () => {
        ed.dispose();
        editorInstanceRef.current = null;
        window.removeEventListener('run-code', runHandler);
        window.removeEventListener('load-snippet', loadSnippetHandler);
      };
    }
  }, []); // Empty dependency array to only run once on mount

  // Update editor model when active tab or language changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

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
    const newTabName = `code${tabs.length + 1}${fileExtension}`;
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

  // Handle file uploads
  const handleFileUpload = (content: string, fileName: string) => {
    // Create a new tab with the file content
    const newTabs = [...tabs];
    const newTab = {
      name: fileName,
      content: content
    };
    newTabs.push(newTab);
    setTabs(newTabs);
    setActiveTab(fileName);

    // Set the editor content
    if (editor) {
      editor.setValue(content);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Tabs for open files */}
      <div className="bg-[#1e1e1e] border-b border-[#333333] flex overflow-x-auto">
        {tabs.map(tab => (
          <div 
            key={tab.name}
            className={`px-4 py-2 text-sm flex items-center border-r border-[#333333] cursor-pointer whitespace-nowrap ${activeTab === tab.name ? 'bg-[#252526] text-white' : 'text-gray-400'}`}
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
