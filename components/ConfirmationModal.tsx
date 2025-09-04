
import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmVariant = 'primary',
}) => {
    if (!isOpen) return null;

    const confirmButtonClasses = {
        primary: 'bg-blue-600 hover:bg-blue-500',
        danger: 'bg-red-600 hover:bg-red-500',
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className={confirmVariant === 'danger' ? 'text-red-400' : 'text-blue-400'} />
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="text-gray-300 mb-6">
                    {message}
                </div>
                <div className="mt-auto flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors font-semibold">Cancel</button>
                    <button onClick={onConfirm} className={`py-2 px-4 ${confirmButtonClasses[confirmVariant]} text-white rounded-md transition-colors font-semibold`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
