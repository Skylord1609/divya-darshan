
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { I18nContent, Yatra, YatraTier, YatraBookingDetails, FamilyMember } from '../types';
import { Icon } from './Icon';
import * as api from '../services/apiService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useToast } from '../contexts/ToastContext';
import { AddFamilyMembers } from './AddFamilyMembers';

export interface YatraBookingModalProps {
    yatra: Yatra;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (details: YatraBookingDetails) => Promise<void>;
}

export const YatraBookingModal = ({ yatra, onClose, onConfirm, t }: YatraBookingModalProps) => {
    const [selectedTier, setSelectedTier] = useState<YatraTier>(yatra.tiers[0]);
    const [numberOfPersons, setNumberOfPersons] = useState(1);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDatesLoading, setIsDatesLoading] = useState(true);

    const [accommodationTier, setAccommodationTier] = useState<'Standard' | 'Comfort' | 'Luxury'>('Standard');
    const [foodPreference, setFoodPreference] = useState<'Satvik' | 'Jain' | 'Regular'>('Satvik');
    const [transportMode, setTransportMode] = useState<'Shared AC Coach' | 'EV'>('Shared AC Coach');
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    const { addToast } = useToast();
    
    useEffect(() => {
        setIsDatesLoading(true);
        api.getYatraAvailability(yatra.id)
            .then(setAvailableDates)
            .finally(() => setIsDatesLoading(false));
    }, [yatra.id]);

    const totalCost = useMemo(() => {
        return selectedTier.cost * numberOfPersons;
    }, [selectedTier, numberOfPersons]);

    const handlePersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        let finalValue = 1;
        if (value >= 1 && value <= yatra.groupSize) {
            finalValue = value;
        } else if (value > yatra.groupSize) {
            finalValue = yatra.groupSize;
        }
        setNumberOfPersons(finalValue);
        // Trim family members if number of persons is reduced
        if (finalValue - 1 < familyMembers.length) {
            setFamilyMembers(prev => prev.slice(0, finalValue - 1));
        }
    }
    
    const handleSubmit = async () => {
        if (!selectedDate) {
            addToast("Please select a departure date.", "info");
            return;
        }
        if (numberOfPersons > 1 && familyMembers.length !== numberOfPersons - 1) {
            addToast(`Please add details for all ${numberOfPersons - 1} family members.`, "info");
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm({
                yatra,
                tier: selectedTier,
                date: selectedDate,
                numberOfPersons,
                accommodationTier,
                foodPreference,
                transportMode,
                familyMembers
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef} 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="yatra-booking-title" 
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close" 
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold z-10"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="yatra-booking-title" className="text-3xl font-bold text-orange-900 font-serif">{t.bookYatra}</h2>
                    <p className="text-stone-600">{yatra.name}</p>
                </div>

                <div className="space-y-6">
                    {/* Tier Selection */}
                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">{t.selectPackage}</label>
                        <div className="space-y-2">
                            {yatra.tiers.map((tier) => (
                                <div key={tier.name} onClick={() => setSelectedTier(tier)} className={`p-3 border-2 rounded-lg cursor-pointer ${selectedTier.name === tier.name ? 'border-orange-500 bg-orange-100/50' : 'border-orange-200 bg-white/50'}`}>
                                    <label className="flex items-center w-full cursor-pointer">
                                        <input type="radio" name="yatra-tier" value={tier.name} checked={selectedTier.name === tier.name} onChange={() => setSelectedTier(tier)} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                                        <div className="ml-3 flex-grow">
                                            <span className="font-bold text-stone-800">{tier.name}</span>
                                            <p className="text-xs text-stone-600">{tier.description}</p>
                                        </div>
                                        <span className="font-bold text-orange-700">₹{tier.cost.toLocaleString('en-IN')}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Number of Persons */}
                    <div>
                        <label htmlFor="numberOfPersons" className="block text-sm font-bold text-orange-800 mb-2">{t.numberOfTravellers}</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="numberOfPersons"
                                type="number"
                                min="1"
                                max={yatra.groupSize}
                                value={numberOfPersons}
                                onChange={handlePersonChange}
                                className="w-24 p-2 text-center rounded-lg border-2 border-orange-200 bg-white"
                            />
                             <span className="text-stone-600">{t.persons} (Max: {yatra.groupSize})</span>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="accommodation" className="block text-sm font-bold text-orange-800 mb-2">Accommodation</label>
                           <select id="accommodation" value={accommodationTier} onChange={(e) => setAccommodationTier(e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white">
                               <option>Standard</option>
                               <option>Comfort</option>
                               <option>Luxury</option>
                           </select>
                        </div>
                        <div>
                           <label htmlFor="food" className="block text-sm font-bold text-orange-800 mb-2">Food Preference</label>
                           <select id="food" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white">
                               <option>Satvik</option>
                               <option>Jain</option>
                               <option>Regular</option>
                           </select>
                        </div>
                         <div className="sm:col-span-2">
                           <label htmlFor="transport" className="block text-sm font-bold text-orange-800 mb-2">Transport</label>
                           <select id="transport" value={transportMode} onChange={(e) => setTransportMode(e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white">
                               <option>Shared AC Coach</option>
                               <option>EV</option>
                           </select>
                        </div>
                    </div>

                    {/* Family Members */}
                    {numberOfPersons > 1 && (
                        <AddFamilyMembers members={familyMembers} setMembers={setFamilyMembers} t={t} maxMembers={numberOfPersons - 1} />
                    )}


                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">{t.selectDepartureDate}</label>
                        {isDatesLoading ? (
                             <div className="flex justify-center items-center h-24"><Icon name="lotus" className="w-8 h-8 animate-spin text-orange-500" /></div>
                        ) : (
                             <div className="grid grid-cols-2 gap-2">
                                {availableDates.map(date => (
                                    <button 
                                        key={date.toISOString()} 
                                        onClick={() => setSelectedDate(date)}
                                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${selectedDate?.getTime() === date.getTime() ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-orange-200 hover:bg-orange-100'}`}
                                    >
                                        {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Total Cost */}
                    <div className="pt-4 border-t-2 border-dashed border-orange-200 flex justify-between items-center">
                        <span className="text-lg font-bold text-orange-800">{t.totalCost}</span>
                        <span className="text-2xl font-bold text-orange-900">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>

                </div>

                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !selectedDate}
                    className="w-full mt-8 bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg transform hover:scale-105 disabled:bg-orange-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Booking...' : `${t.confirmBooking} (₹${totalCost.toLocaleString('en-IN')})`}
                </button>
            </div>
        </div>
    );
};
