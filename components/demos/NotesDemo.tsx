import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Tag, FileText } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;

const NotesDemo = () => {
  return (
    <div className="bg-gray-800 rounded-lg h-full flex font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-700/50 p-3 flex flex-col">
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Folder size={14}/> Folders</h3>
            <div className="space-y-1 text-xs">
                <p className="p-1 rounded bg-gray-700/50">Glaucoma</p>
                <p className="p-1 rounded">Retina</p>
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Tag size={14}/> Tags</h3>
            <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-blue-900/80 px-1.5 py-0.5 rounded-full">Urgent</span>
                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">Pharma</span>
            </div>
        </div>
      </div>
      
      {/* Note List */}
      <div className="w-1/3 border-r border-gray-700/50 p-3 flex flex-col">
          <div className="bg-blue-900/50 p-2 rounded-lg border-l-2 border-blue-400">
              <h4 className="font-semibold text-white text-sm truncate">Angle Closure Patho</h4>
              <p className="text-xs text-gray-400 mt-0.5">Yesterday</p>
          </div>
          <div className="p-2 rounded-lg mt-2">
              <h4 className="font-semibold text-gray-300 text-sm truncate">CRVO vs CRAO</h4>
              <p className="text-xs text-gray-400 mt-0.5">3 days ago</p>
          </div>
      </div>

      {/* Main Content */}
      <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-1/3 p-4 overflow-y-auto"
      >
        <h1 className="text-lg font-bold text-white mb-2">Angle Closure Pathophysiology</h1>
        <ul className="text-xs list-disc pl-4 space-y-1 text-gray-300">
            <li><strong className="text-sky-400">Pupillary Block:</strong> Most common mechanism.</li>
            <li><strong className="text-sky-400">Plateau Iris:</strong> Anteriorly positioned ciliary body.</li>
        </ul>
      </MotionDiv>
    </div>
  );
};

export default NotesDemo;