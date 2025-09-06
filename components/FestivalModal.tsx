import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, Festival } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface FestivalModalProps {
    onSubmit: (data: Partial<Festival>) => Promise<void>;
    initialData?: Festival | null;
    t: I18nContent;
    onClose: () => void;
}

const defaultFormState = {
    name: '',
    date: '',
    description: '',
};

export const FestivalModal = ({ onClose, onSubmit, initialData, t }: FestivalModalProps) => {
    const [formData, setFormData] = useState(defaultFormState);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                date: initialData.date,
                description: initialData.description,
            });
        } else {
            setFormData(defaultFormState);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const festivalPayload: Partial<Festival> = {
                ...(initialData || {}),
                ...formData,
            };

            await onSubmit(festivalPayload);

        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isEditMode = !!initialData;
    const title = isEditMode ? t.editFestival : t.addFestival;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="festival-modal-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="festival-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{title}</h2>
                    <p className="text-stone-600">Update the list of festivals.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Festival Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" name="date" value={formData.date} onChange={handleChange} placeholder="Date (e.g., Varies (Oct-Nov))" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={3} required></textarea>
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};
