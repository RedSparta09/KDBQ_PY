import { useState } from 'react';

const Navbar = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

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

  return (
    <header className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333333]">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-[#0078d4] mr-4">KDB Q Learning Environment</h1>
        <div className="flex space-x-1">
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
        </div>
      </div>
      <div>
        <button id="settings-btn" className="p-1 rounded hover:bg-[#333333]">
          <i className="ri-settings-3-line text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
