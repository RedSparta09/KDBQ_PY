import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Editor from "@/pages/Editor";
import Examples from "@/pages/Examples";
import Resources from "@/pages/Resources";
import AIPractice from "@/pages/AIPractice";
import BookLearning from "@/pages/BookLearning";
import StatusBar from "@/components/StatusBar";
import { executePython } from "./lib/pythonInterpreter";
import { executeQ } from "./lib/qInterpreter";

function Router() {
  const [activePanel, setActivePanel] = useState<'editor' | 'examples' | 'resources' | 'ai-practice' | 'book-learning'>(() => {
    // Check localStorage for active panel preference
    const savedPanel = localStorage.getItem('active-panel');
    return (savedPanel === 'editor' || savedPanel === 'examples' || 
           savedPanel === 'resources' || savedPanel === 'ai-practice' ||
           savedPanel === 'book-learning') 
           ? savedPanel as any : 'editor';
  });
  
  const [language, setLanguage] = useState<'q' | 'python'>(() => {
    // Get from localStorage if available
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage === 'python' ? 'python' : 'q') as 'q' | 'python';
  });

  // Handle panel navigation and update page title
  useEffect(() => {
    const handleNavigation = (e: any) => {
      if (e.detail && e.detail.panel) {
        setActivePanel(e.detail.panel);
        localStorage.setItem('active-panel', e.detail.panel);
      }
    };
    
    window.addEventListener('navigate', handleNavigation);
    
    // Update page title based on active panel
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
      switch (activePanel) {
        case 'editor':
          titleElement.textContent = `${language.toUpperCase()} Code Editor`;
          break;
        case 'examples':
          titleElement.textContent = `${language.toUpperCase()} Examples`;
          break;
        case 'resources':
          titleElement.textContent = `${language.toUpperCase()} Learning Resources`;
          break;
        case 'ai-practice':
          titleElement.textContent = 'AI Practice Generator';
          break;
        case 'book-learning':
          titleElement.textContent = 'Book Learning & Testing';
          break;
        default:
          titleElement.textContent = 'Code Learning Environment';
      }
    }
    
    return () => {
      window.removeEventListener('navigate', handleNavigation);
    };
  }, [activePanel, language]);

  // Handle language changes
  const handleLanguageChange = (newLanguage: 'q' | 'python') => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white">
      <Navbar onLanguageChange={handleLanguageChange} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePanel={activePanel} setActivePanel={(panel) => {
          setActivePanel(panel);
          localStorage.setItem('active-panel', panel);
        }} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {activePanel === 'editor' && <Editor language={language} />}
          {activePanel === 'examples' && <Examples />}
          {activePanel === 'resources' && <Resources />}
          {activePanel === 'ai-practice' && <AIPractice />}
          {activePanel === 'book-learning' && <BookLearning />}
        </div>
      </div>
      
      <StatusBar language={language} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
