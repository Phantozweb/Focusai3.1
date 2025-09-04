
import React from 'react';
import { Bot } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-pulse">
          <Bot className="w-24 h-24 text-blue-500 mx-auto" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-gray-200 mt-4 tracking-wider">
          Focus AI
        </h1>
        <p className="text-gray-400 mt-2">Preparing your AI assistant...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
