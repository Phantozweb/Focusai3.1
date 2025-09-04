import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Lightbulb } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;

const QuizzesDemo = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <MotionDiv 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800 p-4 rounded-lg h-full flex flex-col font-sans overflow-hidden"
        >
            <div className="flex-shrink-0 mb-3">
                <h2 className="text-lg font-bold text-white">Ocular Pharmacology Quiz</h2>
                <p className="text-xs text-gray-400">5 Questions - Medium Difficulty</p>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                <MotionDiv variants={itemVariants} className="bg-gray-900/30 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-200">1. Which class of drug increases uveoscleral outflow?</p>
                     <div className="mt-2 text-xs p-2 rounded-md bg-green-500/10 border border-green-500/30">
                        Prostaglandin Analogs
                    </div>
                </MotionDiv>

                <MotionDiv variants={itemVariants} className="bg-gray-900/30 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-200">2. Match the drug to its side effect.</p>
                     <div className="mt-2 text-xs p-2 rounded-md bg-gray-900/50">
                        <p className="flex items-center gap-2"><Lightbulb size={14} className="text-yellow-400"/>Beta-blockers can cause bronchospasm.</p>
                    </div>
                </MotionDiv>
            </div>
        </MotionDiv>
    );
};

export default QuizzesDemo;