import React from 'react';
import { motion } from 'framer-motion';
import { BookUser } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;

const CasesDemo = () => {
    const variants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.3, duration: 0.5 },
        }),
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg h-full flex flex-col font-sans">
            <MotionDiv custom={0} initial="hidden" animate="visible" variants={variants}>
                <div className="flex items-center gap-3 mb-3">
                    <BookUser size={24} className="text-blue-400"/>
                    <div>
                        <h2 className="font-bold text-white">Sudden Vision Loss in Right Eye</h2>
                        <p className="text-xs text-gray-400">Case Study</p>
                    </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full w-1/3"></div></div>
            </MotionDiv>

            <MotionDiv custom={1} initial="hidden" animate="visible" variants={variants} className="mt-4 bg-gray-900/30 p-3 rounded-lg flex-1">
                 <h3 className="font-semibold text-blue-300 text-sm mb-2">Patient History</h3>
                 <p className="text-xs text-gray-300">A 68-year-old male presents with sudden, painless, and profound vision loss in his right eye upon waking this morning...</p>
            </MotionDiv>

            <MotionDiv custom={2} initial="hidden" animate="visible" variants={variants} className="mt-3 bg-gray-900/50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-200 mb-2">Based on the history, what is the most likely diagnosis?</p>
                <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-md bg-gray-700/70 border-2 border-transparent">Central Retinal Artery Occlusion</div>
                    <div className="p-2 rounded-md bg-blue-600/30 border-2 border-blue-500 text-white">Central Retinal Vein Occlusion</div>
                    <div className="p-2 rounded-md bg-gray-700/70 border-2 border-transparent">Retinal Detachment</div>
                </div>
            </MotionDiv>
        </div>
    );
};

export default CasesDemo;