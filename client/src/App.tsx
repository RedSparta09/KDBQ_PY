import { useState } from "react";
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
import StatusBar from "@/components/StatusBar";

function Router() {
  const [activePanel, setActivePanel] = useState<'editor' | 'examples' | 'resources'>('editor');

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {activePanel === 'editor' && <Editor />}
          {activePanel === 'examples' && <Examples />}
          {activePanel === 'resources' && <Resources />}
        </div>
      </div>
      
      <StatusBar />
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
