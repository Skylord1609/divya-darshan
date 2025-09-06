
import React, { useState, useEffect, useRef } from 'react';
import { I18nContent, Temple } from '../types';
import * as aiService from '../services/aiService';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface CrowdAlertModalProps {
    onProceed: () => void;
    onExploreAlternative: () => void;
    originalTemple: Temple;
    alternativeTemple: Temple;
    t: I18nContent;
    isOpen: boolean;
    onClose: () => void;
}

export const CrowdAlertModal = ({ isOpen, onClose, onProceed, onExploreAlternative, originalTemple, alternativeTemple, t }: CrowdAlertModalProps) => {
    const [comparison, setComparison] = useState('');
    const [isLoadingComparison, setIsLoadingComparison] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (isOpen) {
            let isCancelled = false;
            setIsLoadingComparison(true);
            aiService.generateTempleComparison(originalTemple, alternativeTemple)
                .then(text => {
                    if (!isCancelled) {
                        setComparison(text);
                    }
                })
                .catch(() => {
                    // Fallback in case AI fails
                     if (!isCancelled) {
                        setComparison(`Discover the unique spiritual energies of both ${originalTemple.name} and ${alternativeTemple.name}. Each holds a special place in the hearts of devotees.`);
                    }
                })
                .finally(() => {
                    if (!isCancelled) {
                        setIsLoadingComparison(false);
                    }
                });
            
            return () => {
                isCancelled = true;
            };
        }
    }, [isOpen, originalTemple, alternativeTemple]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="crowd-alert-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                        <Icon name="alert-triangle" className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 id="crowd-alert-title" className="text-2xl font-bold text-stone-900 mt-4">{t.crowdAlertTitle}</h2>
                    <p className="text-stone-600 mt-2 mb-4">{t.crowdAlertInfo}</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center mb-6">
                    <p className="font-bold text-lg text-orange-800">{alternativeTemple.name}</p>
                    <p className="text-sm text-stone-500">{alternativeTemple.location}</p>
                </div>
                
                <div className="bg-stone-100 p-4 rounded-lg mb-8 min-h-[80px]">
                    {isLoadingComparison ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ) : (
                        <p className="text-sm text-stone-700 italic">{comparison}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <button onClick={onExploreAlternative} className="bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-colors w-full sm:w-auto">
                        {t.exploreAlternative}
                    </button>
                    <button onClick={onProceed} className="bg-stone-200 text-stone-800 font-bold py-3 px-6 rounded-full hover:bg-stone-300 transition-colors w-full sm:w-auto">
                        {t.proceedAnyway}
                    </button>
                </div>
            </div>
        </div>
    );
};
