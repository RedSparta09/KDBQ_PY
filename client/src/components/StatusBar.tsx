import React from 'react';

const StatusBar: React.FC = () => {
  return (
    <footer className="bg-[#1e1e1e] px-4 py-1 text-xs text-gray-400 border-t border-[#333333] flex justify-between">
      <div>Ready</div>
      <div>KDB+ v4.0</div>
    </footer>
  );
};

export default StatusBar;
