import { useState, useEffect } from 'react';

interface NavbarProps {
  onLanguageChange?: (language: 'q' | 'python') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLanguageChange }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [language, setLanguage] = useState<'q' | 'python'>(() => {
    // Get from localStorage if available
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage === 'python' ? 'python' : 'q') as 'q' | 'python';
  });
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  const handleRun = () => {
    setIsRunning(true);
    // This would trigger the code execution in a real app
    const event = new CustomEvent('run-code');
    window.dispatchEvent(event);
    setTimeout(() => setIsRunning(false), 300);
  };

  const handleClear = () => {
    const event = new CustomEvent('clear-console');
    window.dispatchEvent(event);
  };
  
  const handleLanguageChange = (newLanguage: 'q' | 'python') => {
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <header className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333333]">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-[#0078d4] mr-4">Code Learning Environment</h1>
        <div className="flex space-x-2 items-center">
          <div className="flex items-center mr-4">
            <label htmlFor="language-select" className="text-white text-sm mr-2">Language:</label>
            <select
              id="language-select"
              className="bg-[#333333] text-white text-sm rounded px-2 py-1 border border-[#555555]"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'q' | 'python')}
            >
              <option value="q">Q</option>
              <option value="python">Python</option>
            </select>
          </div>
          <button 
            id="run-btn" 
            className={`px-3 py-1 bg-[#107c10] text-white rounded flex items-center hover:bg-opacity-90 ${isRunning ? 'bg-opacity-70' : ''}`}
            onClick={handleRun}
          >
            <i className="ri-play-fill mr-1"></i> Run
          </button>
          <button 
            id="clear-btn" 
            className="px-3 py-1 bg-[#333333] text-white rounded flex items-center hover:bg-opacity-90"
            onClick={handleClear}
          >
            <i className="ri-delete-bin-line mr-1"></i> Clear
          </button>
          <button 
            id="upload-btn" 
            className="px-3 py-1 bg-[#0078d4] text-white rounded flex items-center hover:bg-opacity-90"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <i className="ri-upload-line mr-1"></i> Upload
          </button>
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".txt,.csv,.json,.py,.q"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    const content = event.target.result.toString();
                    // Dispatch file upload event
                    const uploadEvent = new CustomEvent('file-upload', { 
                      detail: { content, fileName: file.name } 
                    });
                    window.dispatchEvent(uploadEvent);
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          id="ai-practice-btn" 
          className="px-3 py-1 bg-[#7232c2] text-white rounded flex items-center hover:bg-opacity-90"
          onClick={() => {
            const event = new CustomEvent('navigate', { detail: { panel: 'ai-practice' } });
            window.dispatchEvent(event);
          }}
        >
          <i className="ri-robot-line mr-1"></i> AI Practice
        </button>
        <button id="settings-btn" className="p-1 rounded hover:bg-[#333333]">
          <i className="ri-settings-3-line text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
