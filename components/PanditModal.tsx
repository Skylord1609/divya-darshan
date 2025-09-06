import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, MajorEvent, Pandit } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';

export interface PanditModalProps {
    onSubmit: (data: Partial<Pandit>) => Promise<void>;
    initialData?: Pandit | null;
    event?: MajorEvent;
    events?: MajorEvent[];
    t: I18nContent;
    onClose: () => void;
}

const defaultFormState = {
    name: '',
    location: '',
    specialization: '',
    specialties: '',
    experience: '',
    rating: '',
    cost: '',
    imageUrl: '',
    eventId: ''
};

export const PanditModal = ({ onClose, onSubmit, initialData, event, events, t }: PanditModalProps) => {
    const [formData, setFormData] = useState(defaultFormState);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                location: initialData.location,
                specialization: initialData.specialization,
                specialties: initialData.specialties.join(', '),
                experience: String(initialData.experience),
                rating: String(initialData.rating),
                cost: String(initialData.cost),
                imageUrl: initialData.imageUrl,
                eventId: String(initialData.eventId)
            });
        } else {
            setFormData({
                ...defaultFormState,
                eventId: event ? String(event.id) : (events && events.length > 0 ? String(events[0].id) : '')
            });
        }
    }, [initialData, event, events]);

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
            addToast('Please upload an image for the pandit.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const panditPayload: Partial<Pandit> = {
                id: initialData?.id,
                name: formData.name,
                location: formData.location,
                specialization: formData.specialization,
                specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
                experience: Number(formData.experience) || 0,
                rating: Number(formData.rating) || 4.0,
                cost: Number(formData.cost) || 0,
                imageUrl: formData.imageUrl,
                eventId: Number(formData.eventId)
            };

            await onSubmit(panditPayload);

        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isEditMode = !!initialData;
    const currentEventName = event?.name || events?.find(e => e.id === Number(formData.eventId))?.name;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pandit-modal-title"
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
                    <h2 id="pandit-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{isEditMode ? t.editPandit : t.addPandit}</h2>
                     <p className="text-stone-600">{currentEventName ? `For event: ${currentEventName}` : 'Assign to an event'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Pandit Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Ujjain, MP)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Main Specialization" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="specialties" value={formData.specialties} onChange={handleChange} placeholder="All Specialties (comma-separated)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={2} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience (years)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                        <input type="number" name="rating" value={formData.rating} step="0.1" min="1" max="5" onChange={handleChange} placeholder="Rating (1.0-5.0)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    </div>
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Cost (₹)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />

                    {events && events.length > 0 ? (
                        <div>
                            <label htmlFor="eventId" className="block text-sm font-bold text-orange-800 mb-1">Event</label>
                            <select name="eventId" id="eventId" value={formData.eventId} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-orange-200 bg-white" required>
                                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    ) : !event ? (
                        <p className="text-red-500 text-sm p-2 bg-red-100 rounded-md">No events available to assign a pandit.</p>
                    ) : null}

                    <ImageUpload initialImage={formData.imageUrl} onImageUpload={handleImageUpload} />

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};