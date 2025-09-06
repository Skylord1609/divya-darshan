
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { I18nContent, Pooja, Temple, Language } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageUpload } from './ImageUpload';
import * as api from '../services/apiService';

export interface PoojaModalProps {
    onSubmit: (data: Partial<Pooja>) => Promise<void>;
    initialData?: Pooja | null;
    t: I18nContent;
    onClose: () => void;
    preselectedTempleId?: number;
}

const defaultFormState = {
    name: '',
    description: '',
    cost: '',
    duration: '',
    imageUrl: '',
    deity: '',
    benefits: '',
    samagri: '',
    procedure: ''
};

export const PoojaModal = ({ onClose, onSubmit, initialData, t, preselectedTempleId }: PoojaModalProps) => {
    const [formData, setFormData] = useState(defaultFormState);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const [allTemples, setAllTemples] = useState<Temple[]>([]);
    const [isLoadingTemples, setIsLoadingTemples] = useState(true);
    const [selectedTempleIds, setSelectedTempleIds] = useState<number[]>([]);
    const [templeFilter, setTempleFilter] = useState('');

    useEffect(() => {
        if (preselectedTempleId) return; // Don't fetch if a temple is pre-selected

        let isCancelled = false;
        setIsLoadingTemples(true);
        api.getTemples(Language.EN)
            .then(temples => {
                if (!isCancelled) {
                    setAllTemples(temples.sort((a, b) => a.name.localeCompare(b.name)));
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    addToast('Could not load temples for selection.', 'error');
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoadingTemples(false);
                }
            });
        return () => { isCancelled = true; };
    }, [addToast, preselectedTempleId]);


    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                cost: String(initialData.cost),
                duration: initialData.duration,
                imageUrl: initialData.imageUrl,
                deity: initialData.deity || '',
                benefits: initialData.benefits || '',
                samagri: initialData.samagri || '',
                procedure: initialData.procedure || '',
            });
            setSelectedTempleIds(initialData.templeIds || []);
        } else {
            setFormData(defaultFormState);
            if (preselectedTempleId) {
                setSelectedTempleIds([preselectedTempleId]);
            } else {
                setSelectedTempleIds([]);
            }
        }
    }, [initialData, preselectedTempleId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTempleSelectionChange = (templeId: number) => {
        setSelectedTempleIds(prev =>
            prev.includes(templeId)
                ? prev.filter(id => id !== templeId)
                : [...prev, templeId]
        );
    };

    const handleImageUpload = (base64: string) => {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            addToast('Please upload an image for the pooja.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const poojaPayload: Partial<Pooja> = {
                id: initialData?.id,
                name: formData.name,
                description: formData.description,
                cost: Number(formData.cost) || 0,
                duration: formData.duration,
                imageUrl: formData.imageUrl,
                deity: formData.deity,
                benefits: formData.benefits,
                samagri: formData.samagri,
                procedure: formData.procedure,
                templeIds: selectedTempleIds,
                serviceType: selectedTempleIds.length > 0 ? 'Temple' : 'General'
            };

            await onSubmit(poojaPayload);

        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTemples = useMemo(() => {
        if (!templeFilter) return allTemples;
        return allTemples.filter(temple =>
            temple.name.toLowerCase().includes(templeFilter.toLowerCase()) ||
            temple.location.toLowerCase().includes(templeFilter.toLowerCase())
        );
    }, [allTemples, templeFilter]);
    
    const isEditMode = !!initialData;
    const title = isEditMode ? t.editPooja : t.addPooja;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pooja-modal-title"
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
                    <h2 id="pooja-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{title}</h2>
                    <p className="text-stone-600">Manage divine poojas.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Pooja Name" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={5} required></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Cost (₹)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration (e.g., Approx 1.5 hours)" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    </div>

                    <input type="text" name="deity" value={formData.deity} onChange={handleChange} placeholder="Primary Deity" className="w-full p-3 rounded-lg border-2 border-orange-200" />
                    <textarea name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Benefits of the Pooja" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={5}></textarea>
                    <textarea name="samagri" value={formData.samagri} onChange={handleChange} placeholder="Materials Required (Samagri)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={5}></textarea>
                    <textarea name="procedure" value={formData.procedure} onChange={handleChange} placeholder="Brief Procedure (Vidhi)" className="w-full p-3 rounded-lg border-2 border-orange-200" rows={6}></textarea>

                    {!preselectedTempleId && (
                        <div>
                            <label className="block text-sm font-bold text-orange-800 mb-1">Available at Temples (optional)</label>
                            <p className="text-xs text-stone-500 mb-2">If no temples are selected, this will be a general pooja service.</p>
                            <input
                                type="text"
                                value={templeFilter}
                                onChange={(e) => setTempleFilter(e.target.value)}
                                placeholder="Search temples..."
                                className="w-full p-2 mb-2 rounded-md border-2 border-orange-200"
                            />
                            <div className="max-h-40 overflow-y-auto bg-white border-2 border-orange-200 rounded-lg p-2 space-y-2">
                                {isLoadingTemples ? (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-sm text-stone-500">Loading temples...</p>
                                    </div>
                                ) : filteredTemples.length > 0 ? (
                                    filteredTemples.map(temple => (
                                        <div key={temple.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`temple-${temple.id}`}
                                                checked={selectedTempleIds.includes(temple.id)}
                                                onChange={() => handleTempleSelectionChange(temple.id)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`temple-${temple.id}`} className="ml-3 text-sm text-stone-700 cursor-pointer">{temple.name}</label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-stone-500 p-2">No temples found.</p>
                                )}
                            </div>
                        </div>
                    )}


                    <ImageUpload initialImage={formData.imageUrl} onImageUpload={handleImageUpload} />

                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};
