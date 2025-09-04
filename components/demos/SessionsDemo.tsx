import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Check } from 'lucide-react';

const MotionDiv = motion.div as React.ElementType;

const SessionsDemo = () => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg h-full flex flex-col font-sans">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-3 mb-3">
                    <BrainCircuit size={24} className="text-blue-400"/>
                    <div>
                        <h2 className="font-bold text-white">Binocular Vision Anomalies</h2>
                        <p className="text-xs text-gray-400">Section 2 of 5</p>
                    </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full w-2/5"></div></div>
            </MotionDiv>

            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-gray-900/30 p-3 rounded-lg flex-1"
            >
                 <h3 className="font-semibold text-blue-300 text-sm mb-2">Accommodative Esotropia</h3>
                 <p className="text-xs text-gray-300">This is an inward deviation of the eyes caused by excessive accommodative effort, often associated with high hyperopia.</p>
            </MotionDiv>

            <MotionDiv 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.6 }}
                 className="mt-3 bg-gray-900/50 p-3 rounded-lg"
            >
                <p className="text-sm font-semibold text-gray-200 mb-2">What is the primary treatment?</p>
                <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-md flex items-center gap-2 bg-blue-600/30 border-2 border-blue-500 text-white">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Check size={10}/></div>
                        Full cycloplegic refraction prescription
                    </div>
                    <div className="p-2 rounded-md bg-gray-700/70 border-2 border-transparent">Vision Therapy</div>
                </div>
            </MotionDiv>
        </div>
    );
};

export default SessionsDemo;