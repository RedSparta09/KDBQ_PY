import React from 'react';

interface StatusBarProps {
  language?: 'q' | 'python';
}

const StatusBar: React.FC<StatusBarProps> = ({ language = 'q' }) => {
  return (
    <footer className="bg-[#1e1e1e] px-4 py-1 text-xs text-gray-400 border-t border-[#333333] flex justify-between">
      <div>Ready</div>
      <div>{language === 'q' ? 'KDB+ Q v4.0' : 'Python v3.10'}</div>
    </footer>
  );
};

export default StatusBar;
