


import React, { useRef } from 'react';
import { Yatra, I18nContent } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { useModal } from '../contexts/ModalContext';

interface YatraDetailModalProps {
    yatra: Yatra;
    onClose: () => void;
    onBook: (yatra: Yatra) => void;
    t: I18nContent;
}

export const YatraDetailModal = ({ yatra, onClose, onBook, t }: YatraDetailModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    const modalTitleId = `yatra-title-${yatra.id}`;
    const { imgSrc, onError: handleImageError } = useImageWithFallback(yatra.imageUrl, PLACEHOLDER_IMAGE_URL);
    const { openModal } = useModal();

    const startingPrice = yatra.tiers?.length > 0 ? Math.min(...yatra.tiers.map(t => t.cost)) : null;
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={modalTitleId}
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold z-10"
                >&times;</button>
                
                <div className="relative h-64 rounded-xl overflow-hidden mb-6 group">
                    <img src={imgSrc} alt={yatra.name} onError={handleImageError} className="absolute inset-0 w-full h-full object-cover" />
                    <button
                        onClick={() => openModal('imageDetail', { imageUrl: yatra.imageUrl, altText: yatra.name })}
                        aria-label={`View image of ${yatra.name}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer"
                    >
                        <Icon name="zoom-in" className="w-12 h-12 text-white" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                        <h2 id={modalTitleId} className="text-3xl font-bold text-white drop-shadow-lg">{yatra.name}</h2>
                        <p className="text-amber-200">{t.yatraPackages}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                        <Icon name="rupee" className="w-6 h-6 mx-auto text-orange-700 mb-1" />
                        <p className="font-bold text-lg text-orange-900">{startingPrice !== null ? `₹${startingPrice.toLocaleString('en-IN')}` : 'N/A'}</p>
                        <p className="text-xs text-stone-600">{startingPrice !== null ? 'Starts from' : 'per person'}</p>
                    </div>
                     <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                        <Icon name="clock" className="w-6 h-6 mx-auto text-orange-700 mb-1" />
                        <p className="font-bold text-lg text-orange-900">{yatra.durationDays ?? 'N/A'} Days</p>
                        <p className="text-xs text-stone-600">{typeof yatra.durationDays === 'number' && yatra.durationDays > 1 ? `${yatra.durationDays - 1} Nights` : ''}</p>
                    </div>
                     <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                        <Icon name="users" className="w-6 h-6 mx-auto text-orange-700 mb-1" />
                        <p className="font-bold text-lg text-orange-900">Up to {yatra.groupSize ?? 'N/A'}</p>
                        <p className="text-xs text-stone-600">persons</p>
                    </div>
                </div>

                <p className="text-stone-700 text-lg mb-6">{yatra.description}</p>

                 <div className="my-6">
                    <h3 className="text-2xl font-bold text-orange-900 mb-4 font-serif flex items-center">
                        <Icon name="shopping-bag" className="w-6 h-6 mr-3 text-amber-600" />
                        Packages & Pricing
                    </h3>
                    <div className="space-y-4">
                        {(yatra.tiers || []).map((tier) => (
                            <div key={tier.name} className="bg-white/80 p-4 rounded-lg border-l-4 border-orange-400 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-stone-800">{tier.name}</h4>
                                        <p className="text-sm text-stone-600">{tier.description}</p>
                                    </div>
                                    <p className="font-bold text-xl text-orange-800 whitespace-nowrap ml-4">₹{tier.cost.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-900 mb-4 font-serif flex items-center">
                        <Icon name="cosmic-logo" className="w-6 h-6 mr-3 text-amber-600" />
                        Itinerary
                    </h3>
                    <ol className="relative border-l-2 border-orange-200 ml-4">                  
                        {(yatra.itinerary || []).map((stop, index) => (
                            <li key={index} className="mb-6 ml-8">            
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-200 rounded-full -left-4 ring-8 ring-amber-50 text-orange-800 font-bold">
                                    {index + 1}
                                </span>
                                <h4 className="flex items-center mb-1 text-lg font-semibold text-stone-900">{stop}</h4>
                                <p className="text-sm font-normal text-stone-500">Day {index + 1} of your sacred journey.</p>
                            </li>
                        ))}
                    </ol>
                </div>

                {(yatra.inclusions && yatra.inclusions.length > 0) && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-green-700 mb-2 font-serif flex items-center gap-2"><Icon name="check-circle" className="w-5 h-5"/>Inclusions</h3>
                        <ul className="list-disc list-inside text-stone-700 space-y-1 pl-4">
                            {yatra.inclusions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}
                 {(yatra.exclusions && yatra.exclusions.length > 0) && (
                     <div className="mt-6">
                        <h3 className="text-xl font-bold text-red-700 mb-2 font-serif flex items-center gap-2"><Icon name="x" className="w-5 h-5"/>Exclusions</h3>
                        <ul className="list-disc list-inside text-stone-700 space-y-1 pl-4">
                            {yatra.exclusions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}
                 {(yatra.thingsToCarry && yatra.thingsToCarry.length > 0) && (
                     <div className="mt-6">
                        <h3 className="text-xl font-bold text-blue-700 mb-2 font-serif flex items-center gap-2"><Icon name="clipboard-list" className="w-5 h-5"/>Things to Carry</h3>
                        <ul className="list-disc list-inside text-stone-700 space-y-1 pl-4">
                            {yatra.thingsToCarry.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="bg-stone-200 text-stone-800 font-bold py-3 px-10 rounded-full hover:bg-stone-300 transition-colors duration-300"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => onBook(yatra)}
                        className="bg-orange-600 text-white font-bold py-3 px-10 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg transform hover:scale-105"
                    >
                        {t.bookYatra}
                    </button>
                </div>
            </div>
        </div>
    );
};