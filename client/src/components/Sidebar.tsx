import React from 'react';

interface SidebarProps {
  activePanel: 'editor' | 'examples' | 'resources';
  setActivePanel: (panel: 'editor' | 'examples' | 'resources') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel }) => {
  return (
    <nav className="w-14 md:w-16 bg-[#252526] border-r border-[#333333] flex flex-col items-center py-4 flex-shrink-0">
      <button 
        id="nav-editor" 
        className={`p-2 rounded mb-4 hover:bg-[#333333] ${activePanel === 'editor' ? 'text-[#0078d4] bg-[#333333]' : 'text-white'}`} 
        title="Editor"
        onClick={() => setActivePanel('editor')}
      >
        <i className="ri-code-s-slash-line text-xl"></i>
      </button>
      <button 
        id="nav-examples" 
        className={`p-2 rounded mb-4 hover:bg-[#333333] ${activePanel === 'examples' ? 'text-[#0078d4] bg-[#333333]' : 'text-white'}`} 
        title="Examples"
        onClick={() => setActivePanel('examples')}
      >
        <i className="ri-book-open-line text-xl"></i>
      </button>
      <button 
        id="nav-resources" 
        className={`p-2 rounded mb-4 hover:bg-[#333333] ${activePanel === 'resources' ? 'text-[#0078d4] bg-[#333333]' : 'text-white'}`} 
        title="Resources"
        onClick={() => setActivePanel('resources')}
      >
        <i className="ri-graduation-cap-line text-xl"></i>
      </button>
      <button 
        id="nav-settings" 
        className="p-2 rounded text-white mt-auto hover:bg-[#333333]" 
        title="Settings"
      >
        <i className="ri-user-settings-line text-xl"></i>
      </button>
    </nav>
  );
};

export default Sidebar;
