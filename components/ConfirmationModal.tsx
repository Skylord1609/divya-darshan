
import React, { useRef } from 'react';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface ConfirmationModalProps {
    onConfirm: () => void;
    title: string;
    message: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <Icon name="alert-triangle" className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 id="confirmation-modal-title" className="text-2xl font-bold text-stone-900 mt-4">{title}</h2>
                    <p className="text-stone-600 mt-2">{message}</p>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="bg-stone-200 text-stone-800 font-bold py-2 px-6 rounded-full hover:bg-stone-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
