
import React, { useState, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, Pandit } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';
import * as api from '../services/apiService';

export interface PanditRegistrationModalProps {
    t: I18nContent;
    onClose: () => void;
}

export const PanditRegistrationModal = ({ onClose, t }: PanditRegistrationModalProps) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [experience, setExperience] = useState('');
    const [services, setServices] = useState<('Online' | 'Offline')[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const handleServiceToggle = (service: 'Online' | 'Offline') => {
        setServices(prev => 
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            addToast('Please upload a profile image.', 'error');
            return;
        }
        if (services.length === 0) {
            addToast('Please select at least one service type (Online/Offline).', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const panditData: Omit<Pandit, 'id' | 'status' | 'rating' | 'eventId'> = {
                name,
                location,
                specialization: specialties.split(',')[0]?.trim() || 'General Rituals',
                specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
                experience: Number(experience) || 0,
                cost: 0, // Admin will set cost after verification
                imageUrl,
                services,
                availability: { // Default availability
                    days: [1, 2, 3, 4, 5],
                    hours: [{ start: "09:00", end: "17:00" }]
                }
            };

            const result = await api.submitPanditRegistration(panditData);
            addToast(result.message, 'success');
            onClose();

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
                aria-labelledby="pandit-reg-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="user-edit" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="pandit-reg-title" className="text-3xl font-bold text-orange-900 font-serif">Join as a Pandit</h2>
                    <p className="text-stone-600">Register to offer your services to devotees nationwide.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <ImageUpload onImageUpload={setImageUrl} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State (e.g., Varanasi, Uttar Pradesh)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <input type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Years of Experience" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder="Specialties (e.g., Griha Pravesh, Marriage, Rudra Abhishek)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={3} required />
                    
                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">Services Offered</label>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => handleServiceToggle('Offline')} className={`flex-1 p-3 rounded-lg font-semibold border-2 ${services.includes('Offline') ? 'bg-primary text-white border-primary' : 'bg-white border-orange-200'}`}>At Devotee's Location</button>
                            <button type="button" onClick={() => handleServiceToggle('Online')} className={`flex-1 p-3 rounded-lg font-semibold border-2 ${services.includes('Online') ? 'bg-primary text-white border-primary' : 'bg-white border-orange-200'}`}>Online / Video Call</button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};