import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;

const AssistantDemo = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-end font-sans">
      <MotionDiv
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* User Message */}
        <MotionDiv variants={itemVariants} className="flex justify-end items-start gap-2">
          <div className="bg-blue-600 text-white p-3 rounded-lg rounded-br-none max-w-[80%]">
            <p className="text-sm">Explain the pathophysiology of primary open-angle glaucoma.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User size={16} />
          </div>
        </MotionDiv>

        {/* AI Message */}
        <MotionDiv variants={itemVariants} className="flex justify-start items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-blue-400" />
          </div>
          <div className="bg-gray-700 text-gray-200 p-3 rounded-lg rounded-bl-none max-w-[80%]">
            <p className="text-sm font-semibold mb-2">Of course. Primary Open-Angle Glaucoma (POAG) is primarily characterized by...</p>
            <ul className="text-xs list-disc pl-4 space-y-1 text-gray-300">
              <li><strong className="text-sky-400">Increased IOP:</strong> Due to reduced aqueous humor outflow through the trabecular meshwork.</li>
              <li><strong className="text-sky-400">Optic Nerve Damage:</strong> Leads to progressive, irreversible vision loss.</li>
            </ul>
          </div>
        </MotionDiv>
      </MotionDiv>

      {/* Input bar */}
      <div className="mt-4 p-2 bg-gray-900/50 rounded-lg flex items-center">
        <p className="text-sm text-gray-400 flex-1">Message Focus AI...</p>
        <div className="w-8 h-8 bg-blue-600 rounded-md"></div>
      </div>
    </div>
  );
};

export default AssistantDemo;