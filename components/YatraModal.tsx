import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, Yatra, YatraTier } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';

export interface YatraModalProps {
    onSubmit: (data: Partial<Yatra>) => Promise<void>;
    initialData?: Yatra | null;
    t: I18nContent;
    onClose: () => void;
}

const defaultFormState = {
    name: '',
    description: '',
    imageUrl: '',
    itinerary: '',
    durationDays: '',
    groupSize: '',
    inclusions: '',
    exclusions: '',
    thingsToCarry: '',
};

export const YatraModal = ({ onClose, onSubmit, initialData, t }: YatraModalProps) => {
    const [formData, setFormData] = useState(defaultFormState);
    const [tiers, setTiers] = useState<YatraTier[]>([{ name: 'Standard', cost: 0, description: '' }]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                imageUrl: initialData.imageUrl,
                itinerary: (initialData.itinerary || []).join(', '),
                durationDays: String(initialData.durationDays),
                groupSize: String(initialData.groupSize),
                inclusions: (initialData.inclusions || []).join(', '),
                exclusions: (initialData.exclusions || []).join(', '),
                thingsToCarry: (initialData.thingsToCarry || []).join(', '),
            });
            setTiers(initialData.tiers && initialData.tiers.length > 0 ? initialData.tiers : [{ name: 'Standard', cost: 0, description: '' }]);
        } else {
            setFormData(defaultFormState);
            setTiers([{ name: 'Standard', cost: 0, description: '' }]);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (base64: string) => {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
    };

    const handleTierChange = (index: number, field: keyof YatraTier, value: string) => {
        const newTiers = [...tiers];
        const tierToUpdate = { ...newTiers[index] };

        if (field === 'cost') {
            tierToUpdate[field] = Number(value);
        } else {
            tierToUpdate[field] = value;
        }
        newTiers[index] = tierToUpdate;
        setTiers(newTiers);
    };

    const addTier = () => {
        setTiers([...tiers, { name: '', cost: 0, description: '' }]);
    };

    const removeTier = (index: number) => {
        if (tiers.length > 1) {
            setTiers(tiers.filter((_, i) => i !== index));
        } else {
            addToast("A yatra must have at least one pricing tier.", "info");
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            addToast('Please upload an image for the yatra.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const yatraPayload: Partial<Yatra> = {
                id: initialData?.id,
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl,
                itinerary: formData.itinerary.split(',').map(item => item.trim()).filter(Boolean),
                tiers: tiers,
                durationDays: Number(formData.durationDays) || 0,
                groupSize: Number(formData.groupSize) || 0,
                inclusions: formData.inclusions.split(',').map(item => item.trim()).filter(Boolean),
                exclusions: formData.exclusions.split(',').map(item => item.trim()).filter(Boolean),
                thingsToCarry: formData.thingsToCarry.split(',').map(item => item.trim()).filter(Boolean),
            };

            await onSubmit(yatraPayload);

        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isEditMode = !!initialData;
    const title = isEditMode ? t.editYatra : t.addYatra;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="yatra-modal-title"
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
                    <h2 id="yatra-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{title}</h2>
                    <p className="text-stone-600">Manage sacred yatra packages.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Yatra Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={3} required></textarea>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} placeholder="Duration (Days)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                        <input type="number" name="groupSize" value={formData.groupSize} onChange={handleChange} placeholder="Group Size" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">Pricing Tiers</label>
                        <div className="space-y-4">
                            {tiers.map((tier, index) => (
                                <div key={index} className="bg-white/50 p-3 rounded-lg border border-orange-200 relative">
                                    {tiers.length > 1 && (
                                        <button type="button" onClick={() => removeTier(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label="Remove Tier">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} placeholder="Tier Name (e.g., Standard)" className="w-full p-2 rounded-md border border-orange-300" required />
                                        <input type="number" value={tier.cost} onChange={(e) => handleTierChange(index, 'cost', e.target.value)} placeholder="Cost (₹)" className="w-full p-2 rounded-md border border-orange-300" required />
                                    </div>
                                    <textarea value={tier.description} onChange={(e) => handleTierChange(index, 'description', e.target.value)} placeholder="Tier Description" className="w-full p-2 mt-2 rounded-md border border-orange-300" rows={2} required />
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addTier} className="mt-2 text-sm font-semibold text-primary hover:text-secondary">+ Add Tier</button>
                    </div>

                    <ImageUpload initialImage={formData.imageUrl} onImageUpload={handleImageUpload} />
                    <textarea name="itinerary" value={formData.itinerary} onChange={handleChange} placeholder="Itinerary (comma-separated stops)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={2}></textarea>
                    <textarea name="inclusions" value={formData.inclusions} onChange={handleChange} placeholder="Inclusions (comma-separated)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={2}></textarea>
                    <textarea name="exclusions" value={formData.exclusions} onChange={handleChange} placeholder="Exclusions (comma-separated)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={2}></textarea>
                    <textarea name="thingsToCarry" value={formData.thingsToCarry} onChange={handleChange} placeholder="Things to Carry (comma-separated)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={2}></textarea>

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};