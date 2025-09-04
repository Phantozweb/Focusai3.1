
import React from 'react';
import { X, WandSparkles, ArrowRight } from 'lucide-react';

interface TrialEndModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
}

const TrialEndModal: React.FC<TrialEndModalProps> = ({ isOpen, onClose, onSubscribe }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 flex flex-col items-center text-center">
                <WandSparkles className="w-12 h-12 text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">Your Free Trial Has Ended</h2>
                <p className="text-gray-300 my-4">
                    Thank you for trying Focus.AI! To continue using our suite of powerful study tools, please subscribe to a plan.
                </p>
                <div className="mt-2 flex w-full gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-2.5 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors font-semibold"
                    >
                        Maybe Later
                    </button>
                    <button 
                        onClick={onSubscribe} 
                        className="group flex-1 relative inline-flex items-center justify-center px-4 py-2.5 font-bold text-white bg-blue-700 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-blue-600"
                    >
                        Subscribe Now
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialEndModal;