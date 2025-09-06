
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, MajorEvent, CrowdLevel } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';

export interface EventModalProps {
    onSubmit: (data: Partial<MajorEvent>) => Promise<void>;
    initialData?: MajorEvent | null;
    t: I18nContent;
    onClose: () => void;
}

const CROWD_LEVELS: CrowdLevel[] = ['Low', 'Medium', 'High', 'Very High'];

const defaultFormState = {
    name: '',
    description: '',
    dates: '',
    location: '',
    imageUrl: '',
    crowdLevel: 'Medium' as CrowdLevel
};

export const EventModal = ({ onClose, onSubmit, initialData, t }: EventModalProps) => {
    const [formData, setFormData] = useState(defaultFormState);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                dates: initialData.dates,
                location: initialData.location,
                imageUrl: initialData.imageUrl,
                crowdLevel: initialData.crowdLevel,
            });
        } else {
            setFormData(defaultFormState);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (base64: string) => {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            addToast('Please upload an image for the event.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const eventPayload: Partial<MajorEvent> = {
                ...(initialData || {}),
                id: initialData?.id,
                ...formData,
            };

            await onSubmit(eventPayload);

        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isEditMode = !!initialData;
    const title = isEditMode ? t.editEvent : t.addEvent;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-modal-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="event-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{title}</h2>
                    <p className="text-stone-600">Update the major events.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Event Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={3} required></textarea>
                     <input type="text" name="dates" value={formData.dates} onChange={handleChange} placeholder="Dates (e.g., July (Annual))" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Puri, Odisha)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <ImageUpload initialImage={formData.imageUrl} onImageUpload={handleImageUpload} />
                    
                    <div>
                        <label htmlFor="crowdLevel" className="block text-sm font-bold text-orange-800 mb-1">Crowd Level</label>
                        <select
                            name="crowdLevel"
                            id="crowdLevel"
                            value={formData.crowdLevel}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border-2 border-orange-200 bg-white"
                        >
                            {CROWD_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};
