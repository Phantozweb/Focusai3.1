import React from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate, ChevronRight, Search } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;
const MotionH1 = motion.h1 as React.ElementType;
const MotionBlockquote = motion.blockquote as React.ElementType;

const CanvasDemo = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gray-800 rounded-lg h-full flex font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-700/50 p-3 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-white font-semibold">
          <LayoutTemplate size={18} className="text-blue-400" />
          <p className="text-sm">Navigation</p>
        </div>
        <div className="relative mb-2">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <div className="w-full bg-gray-700 rounded-md pl-7 h-7 text-sm"></div>
        </div>
        <MotionDiv 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1 text-xs text-gray-400"
        >
            <MotionDiv variants={itemVariants} className="flex items-center gap-1 p-1 rounded bg-gray-700/50 text-white"> <ChevronRight size={14} /> Introduction</MotionDiv>
            <MotionDiv variants={itemVariants} className="flex items-center gap-1 p-1 rounded"> <ChevronRight size={14} /> Pathophysiology</MotionDiv>
            <MotionDiv variants={itemVariants} className="flex items-center gap-1 p-1 rounded"> <ChevronRight size={14} /> Diagnosis</MotionDiv>
        </MotionDiv>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <MotionDiv 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
        >
            <MotionH1 variants={itemVariants} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Keratoconus
            </MotionH1>
            <MotionDiv variants={itemVariants}>
                <h2 className="text-lg font-semibold text-blue-300">Pathophysiology</h2>
                <p className="text-xs text-gray-300 mt-1">A progressive, non-inflammatory corneal ectasia characterized by stromal thinning and apical protrusion.</p>
            </MotionDiv>
            <MotionBlockquote variants={itemVariants} className="border-l-4 border-blue-500 pl-3 text-xs italic text-gray-400">
                Clinical Tip: Look for Fleischer's ring, an iron line at the base of the cone.
            </MotionBlockquote>
        </MotionDiv>
      </div>
    </div>
  );
};

export default CanvasDemo;