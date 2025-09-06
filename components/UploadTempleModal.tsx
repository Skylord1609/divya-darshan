
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { Temple, AdminTemple, TempleSubmissionData } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';

export interface UploadTempleModalProps {
    onSubmit: (data: TempleSubmissionData & { id?: number }) => Promise<void>;
    initialData?: Temple | AdminTemple | null;
    title?: string;
    buttonText?: string;
    onClose: () => void;
}

const defaultFormState = {
    name: '',
    location: '',
    history: '',
    imageUrl: '',
    darshanTimings: '',
};

export const UploadTempleModal = ({ onClose, onSubmit, initialData, title, buttonText }: UploadTempleModalProps) => {
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
                history: initialData.history,
                imageUrl: initialData.imageUrl,
                darshanTimings: initialData.darshanTimings || '',
            });
        } else {
            setFormData(defaultFormState);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (base64: string) => {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            addToast('Please upload an image for the temple.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const templeData = {
                id: initialData?.id,
                ...formData
            };
            await onSubmit(templeData);
            
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-modal-title"
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
                    <h2 id="upload-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{title || 'Share a Sacred Place'}</h2>
                    <p className="text-stone-600">Help us document and preserve our heritage.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Temple Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., City, State)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="history" value={formData.history} onChange={handleChange} placeholder="A brief history or significance" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={4} required></textarea>
                    <ImageUpload initialImage={formData.imageUrl} onImageUpload={handleImageUpload} />
                    <input type="text" name="darshanTimings" value={formData.darshanTimings} onChange={handleChange} placeholder="Darshan Timings (e.g., 6 AM - 9 PM)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Submitting...' : (buttonText || 'Submit for Review')}
                    </button>
                </form>
            </div>
        </div>
    );
};