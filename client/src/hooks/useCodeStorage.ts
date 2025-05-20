import { useState, useEffect } from 'react';

interface SavedSnippet {
  name: string;
  content: string;
  timestamp: number;
}

export const useCodeStorage = () => {
  const [snippets, setSnippets] = useState<Record<string, SavedSnippet>>(() => {
    const saved = localStorage.getItem('qSnippets');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('qSnippets', JSON.stringify(snippets));
  }, [snippets]);

  const saveCode = (name: string, code: string) => {
    setSnippets(prev => ({
      ...prev,
      [name]: {
        name,
        content: code,
        timestamp: Date.now()
      }
    }));
  };

  const getLastCode = (name: string): string | null => {
    return snippets[name]?.content || null;
  };

  const getSavedSnippets = (): SavedSnippet[] => {
    return Object.values(snippets)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Limit to the 10 most recent snippets
  };

  const saveSnippet = (name: string, code: string) => {
    saveCode(name, code);
    
    // Also ping the server to save it
    fetch('/api/snippets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, code }),
      credentials: 'include',
    }).catch(err => {
      console.error('Failed to save snippet to server:', err);
    });
  };

  return {
    saveCode,
    getLastCode,
    getSavedSnippets,
    saveSnippet,
  };
};
