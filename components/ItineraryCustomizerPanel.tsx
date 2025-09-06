

import React, { useState, useMemo } from 'react';
import { Temple, I18nContent, FamilyMember, YatraPlanSettings, YatraPlanItem } from '../types';
import { Icon } from './Icon';
import { AddFamilyMembers } from './AddFamilyMembers';

export const calculateYatraCosts = (plan: YatraPlanItem[], settings: YatraPlanSettings) => {
    const accommodationCostMap = { 'Standard (Dharamshalas)': 800, 'Comfort (3-star Hotels)': 3000, 'Luxury (5-star Hotels)': 8000 };
    const transportCostMap = { 'Own Car': 500, 'Shared AC Coach': 1500, 'EV': 1200, 'Private SUV': 4000 };
    const transportCarbonMap = { 'Own Car': 25, 'Shared AC Coach': 10, 'EV': 2, 'Private SUV': 35 };

    const { totalDays, baseTempleCost } = plan.reduce((acc, item) => {
        acc.totalDays += item.temple.estimatedDays || 1;
        acc.baseTempleCost += item.temple.estimatedCost || 200; // a small default
        return acc;
    }, { totalDays: 0, baseTempleCost: 0 });
    
    const accommodationCost = accommodationCostMap[settings.accommodationTier] * totalDays * settings.numberOfPersons;
    const transportCost = transportCostMap[settings.transportMode] * totalDays;
    const templeEntryCost = baseTempleCost * settings.numberOfPersons;
    const carbonFootprint = (totalDays * transportCarbonMap[settings.transportMode]) * settings.numberOfPersons;

    const totalCost = accommodationCost + transportCost + templeEntryCost;

    return { totalCost, totalDays, accommodationCost, transportCost, templeEntryCost, carbonFootprint };
};


interface ItineraryCustomizerPanelProps {
    allTemples: Temple[];
    itinerary: Temple[];
    setItinerary: (itinerary: Temple[]) => void;
    onToggleTemple: (temple: Temple) => void;
    onGetQuotes: () => void;
    settings: YatraPlanSettings;
    setSettings: React.Dispatch<React.SetStateAction<YatraPlanSettings>>;
    t: I18nContent;
}

export const ItineraryCustomizerPanel = ({ allTemples, itinerary, setItinerary, onToggleTemple, onGetQuotes, settings, setSettings, t }: ItineraryCustomizerPanelProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    const handleSettingChange = <K extends keyof YatraPlanSettings>(key: K, value: YatraPlanSettings[K]) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const { totalCost, totalDays, accommodationCost, transportCost, templeEntryCost, carbonFootprint } = useMemo(() => {
        // This is a simplified calculation for display.
        // It should mirror the logic in `calculateYatraCosts` but this way we avoid prop drilling the full plan.
        const accommodationCostMap = { 'Standard (Dharamshalas)': 800, 'Comfort (3-star Hotels)': 3000, 'Luxury (5-star Hotels)': 8000 };
        const transportCostMap = { 'Own Car': 500, 'Shared AC Coach': 1500, 'EV': 1200, 'Private SUV': 4000 };
        
        const { days, cost: baseTempleCost } = itinerary.reduce((acc, temple) => {
            acc.days += temple.estimatedDays || 1;
            acc.cost += temple.estimatedCost || 200;
            return acc;
        }, { days: 0, cost: 0 });

        const accomm = accommodationCostMap[settings.accommodationTier] * days * settings.numberOfPersons;
        const transport = transportCostMap[settings.transportMode] * days;
        const temple = baseTempleCost * settings.numberOfPersons;

        return {
            totalCost: accomm + transport + temple,
            totalDays: days,
            accommodationCost: accomm,
            transportCost: transport,
            templeEntryCost: temple,
            carbonFootprint: 0 // Simplified for display
        };
    }, [itinerary, settings]);


    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return allTemples.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !itinerary.some(it => it.id === t.id));
    }, [searchQuery, allTemples, itinerary]);
    
    const handleAddFromSearch = (temple: Temple) => {
        onToggleTemple(temple);
        setSearchQuery('');
        setIsSearchActive(false);
    }
    
    return (
        <div className="bg-white h-full flex flex-col">
            <header className="p-4 border-b border-stone-200 flex-shrink-0">
                <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                    <Icon name="compass" className="w-7 h-7" />
                    Yatra Planner
                </h2>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Search & Itinerary */}
                <div className="relative">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setIsSearchActive(true)} onBlur={() => setTimeout(() => setIsSearchActive(false), 200)} placeholder="Search to add a temple..." className="w-full p-2 pl-8 rounded-lg border-2 border-orange-200 bg-white" />
                    <Icon name="search" className="w-5 h-5 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    {isSearchActive && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-stone-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.map(temple => (
                                <button key={temple.id} onClick={() => handleAddFromSearch(temple)} className="w-full text-left px-4 py-2 hover:bg-amber-100">{temple.name}</button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Your Itinerary ({itinerary.length} stops)</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border rounded-lg p-2 bg-stone-50">
                        {itinerary.length > 0 ? itinerary.map(temple => (
                            <div key={temple.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
                                <p className="text-sm font-semibold text-stone-700">{temple.name}</p>
                                <button onClick={() => onToggleTemple(temple)} className="p-1 text-red-500 hover:text-red-700"><Icon name="trash" className="w-4 h-4" /></button>
                            </div>
                        )) : <p className="text-sm text-stone-500 italic p-2">Select temples from the map or search bar to begin.</p>}
                    </div>
                </div>

                {/* Customization */}
                <div className="space-y-4">
                    <input type="date" value={settings.startDate} onChange={e => handleSettingChange('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white" />
                    <div>
                        <label htmlFor="numberOfPersons" className="block text-sm font-bold text-orange-800 mb-1">{t.numberOfTravellers}</label>
                        <input id="numberOfPersons" type="number" min="1" value={settings.numberOfPersons} onChange={(e) => handleSettingChange('numberOfPersons', Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white" />
                    </div>
                    {settings.numberOfPersons > 1 && <AddFamilyMembers members={settings.familyMembers} setMembers={(mems) => handleSettingChange('familyMembers', mems)} t={t} maxMembers={settings.numberOfPersons - 1} />}
                    <div>
                       <label htmlFor="accommodation" className="block text-sm font-bold text-orange-800 mb-1">Accommodation</label>
                       <select id="accommodation" value={settings.accommodationTier} onChange={(e) => handleSettingChange('accommodationTier', e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white"><option>Standard (Dharamshalas)</option><option>Comfort (3-star Hotels)</option><option>Luxury (5-star Hotels)</option></select>
                    </div>
                    <div>
                       <label htmlFor="transport" className="block text-sm font-bold text-orange-800 mb-1">Transport</label>
                       <select id="transport" value={settings.transportMode} onChange={(e) => handleSettingChange('transportMode', e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white"><option>Own Car</option><option>Shared AC Coach</option><option>Private SUV</option><option>EV</option></select>
                    </div>
                     <div>
                       <label htmlFor="food" className="block text-sm font-bold text-orange-800 mb-1">Food Preference</label>
                       <select id="food" value={settings.foodPreference} onChange={(e) => handleSettingChange('foodPreference', e.target.value as any)} className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white"><option>Satvik</option><option>Jain</option><option>Regular</option></select>
                    </div>
                </div>
            </div>

            <footer className="p-4 border-t border-stone-200 space-y-4 mt-auto flex-shrink-0">
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div>
                        <label htmlFor="budget" className="block text-sm font-bold text-primary mb-1">My Budget (₹)</label>
                        <input id="budget" type="number" value={settings.budget || ''} onChange={e => handleSettingChange('budget', Number(e.target.value))} placeholder="e.g., 50000" className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white" />
                    </div>
                    <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between"><span>Temple Entries:</span><span>₹{templeEntryCost.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Accommodation ({totalDays} days):</span><span>₹{accommodationCost.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Transport:</span><span>₹{transportCost.toLocaleString()}</span></div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-dashed border-amber-300 flex justify-between items-center">
                        <span className="font-bold">Estimated Cost:</span>
                        <span className="font-bold text-2xl text-primary">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <button onClick={onGetQuotes} disabled={itinerary.length === 0} className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors disabled:bg-stone-400">
                    Get Quotes
                </button>
            </footer>
        </div>
    );
};