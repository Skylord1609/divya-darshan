import React, { useState, useEffect, useRef } from 'react';
import { I18nContent, Pooja, Temple, Language } from '../types';
import * as api from '../services/apiService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Icon } from './Icon';

export interface ManageTemplePoojasModalProps {
    temple: Temple;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (templeId: number, selectedPoojaIds: number[]) => Promise<void>;
}

export const ManageTemplePoojasModal = ({ temple, t, onClose, onConfirm }: ManageTemplePoojasModalProps) => {
    const [allPoojas, setAllPoojas] = useState<Pooja[]>([]);
    const [selectedPoojaIds, setSelectedPoojaIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        let isCancelled = false;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [poojas, associatedPoojas] = await Promise.all([
                    api.getPoojas(Language.EN),
                    api.getPoojasByTempleId(temple.id, Language.EN)
                ]);
                if (!isCancelled) {
                    setAllPoojas(poojas.sort((a,b) => a.name.localeCompare(b.name)));
                    setSelectedPoojaIds(associatedPoojas.map(p => p.id));
                }
            } catch (error) {
                // In a real app, show a toast or error message
                console.error("Failed to load pooja data for management", error);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
        return () => { isCancelled = true; };
    }, [temple.id]);
    
    const handleTogglePooja = (poojaId: number) => {
        setSelectedPoojaIds(prev =>
            prev.includes(poojaId) ? prev.filter(id => id !== poojaId) : [...prev, poojaId]
        );
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await onConfirm(temple.id, selectedPoojaIds);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="manage-poojas-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold">&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="manage-poojas-title" className="text-3xl font-bold text-orange-900 font-serif">{t.managePoojas}</h2>
                    <p className="text-stone-600">for <span className="font-semibold">{temple.name}</span></p>
                </div>

                <div className="flex-grow overflow-y-auto bg-white border-2 border-orange-200 rounded-lg p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Icon name="lotus" className="w-8 h-8 animate-spin text-orange-500" /></div>
                    ) : (
                        allPoojas.map(pooja => (
                            <div key={pooja.id} className="flex items-center p-2 rounded-md hover:bg-amber-100/50">
                                <input
                                    type="checkbox"
                                    id={`pooja-assoc-${pooja.id}`}
                                    checked={selectedPoojaIds.includes(pooja.id)}
                                    onChange={() => handleTogglePooja(pooja.id)}
                                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`pooja-assoc-${pooja.id}`} className="ml-3 text-stone-800 cursor-pointer flex-grow">{pooja.name}</label>
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={handleSubmit} 
                    disabled={isSaving || isLoading} 
                    className="w-full mt-6 bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                >
                    {isSaving ? 'Saving...' : t.saveAssociations}
                </button>
            </div>
        </div>
    );
};