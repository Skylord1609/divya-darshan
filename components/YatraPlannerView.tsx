

import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import 'YatraQuoteRequest' type for use in the handleGetQuotes function.
import { I18nContent, Language, Temple, Yatra, YatraPlanItem, YatraPlanSettings, CustomYatraBookingDetails, YatraQuoteRequest } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { TempleMap } from './TempleMap';
import { ItineraryCustomizerPanel, calculateYatraCosts } from './ItineraryCustomizerPanel';
import { Icon } from './Icon';
import { YatraCard } from './YatraCard';
import { YatraCardSkeleton } from './YatraCardSkeleton';
import { CardAnimator } from './CardAnimator';

interface YatraPlannerViewProps {
    t: I18nContent;
    language: Language;
    yatraPlan: YatraPlanItem[];
    setYatraPlan: (plan: YatraPlanItem[]) => void;
    toggleInYatraPlan: (temple: Temple) => void;
    settings: YatraPlanSettings;
    setSettings: React.Dispatch<React.SetStateAction<YatraPlanSettings>>;
}

type ActiveTab = 'packages' | 'custom';

export const YatraPlannerView = ({ t, language, yatraPlan, setYatraPlan, toggleInYatraPlan, settings, setSettings }: YatraPlannerViewProps) => {
    // State for custom planner
    const [allTemples, setAllTemples] = useState<Temple[]>([]);
    const [isLoadingTemples, setIsLoadingTemples] = useState(false);

    // New state for packages tab
    const [packages, setPackages] = useState<Yatra[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>('custom');
    
    // Hooks
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const { openModal } = useModal();

    // Fetch data based on active tab
    useEffect(() => {
        let isCancelled = false;
        if (activeTab === 'custom') {
            setIsLoadingTemples(true);
            api.getTemples(language)
                .then(data => { if (!isCancelled) setAllTemples(data.sort((a,b) => a.name.localeCompare(b.name)))})
                .catch(() => { if (!isCancelled) addToast("Could not load temple list", "error")})
                .finally(() => { if (!isCancelled) setIsLoadingTemples(false)});
        } else if (activeTab === 'packages') {
            setIsLoadingPackages(true);
            api.getYatras(language)
                .then(data => { if (!isCancelled) setPackages(data)})
                .catch(() => { if (!isCancelled) addToast("Could not load Yatra packages", "error")})
                .finally(() => { if (!isCancelled) setIsLoadingPackages(false)});
        }
        return () => { isCancelled = true; };
    }, [language, addToast, activeTab]);
    
    
    const handleSetItineraryFromTemples = (temples: Temple[]) => {
        const newPlan: YatraPlanItem[] = temples.map(temple => {
            const existingItem = yatraPlan.find(item => item.temple.id === temple.id);
            if (existingItem) return existingItem;
            return {
                temple,
                visitDate: new Date().toISOString().split('T')[0],
                travelMode: 'Car',
                priority: 'Medium'
            };
        });
        setYatraPlan(newPlan);
    };

    const handleGetQuotes = () => {
        if (!currentUser) {
            openModal('login');
            return;
        }
        if (yatraPlan.length < 1) {
            addToast("Please select at least one temple for your yatra.", "info");
            return;
        }
        
        const { totalCost, carbonFootprint } = calculateYatraCosts(yatraPlan, settings);

        const details: Omit<YatraQuoteRequest, 'userName'|'userEmail'|'userPhone'> = {
            itinerary: yatraPlan.map(i => i.temple),
            numberOfPersons: settings.numberOfPersons,
            familyMembers: settings.familyMembers,
            accommodationTier: settings.accommodationTier,
            foodPreference: settings.foodPreference,
            transportMode: settings.transportMode,
            startDate: new Date(settings.startDate),
            totalCost,
            carbonFootprint,
        };

        openModal('yatraQuote', { details });
    };

    const TabButton = ({ tab, label }: { tab: ActiveTab; label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-lg rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${
                activeTab === tab 
                    ? 'bg-main text-primary border-b-4 border-primary' 
                    : 'bg-transparent text-text-muted hover:bg-white/50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-main">
            <header className="flex-shrink-0 bg-white/60 backdrop-blur-sm border-b border-stone-200 px-4">
                <div className="flex items-center gap-2">
                    <TabButton tab="custom" label="Custom Planner" />
                    <TabButton tab="packages" label={t.yatraPackages} />
                </div>
            </header>
            <main className="flex-grow overflow-hidden">
                <div key={activeTab} className="h-full animate-fade-in">
                    {activeTab === 'packages' && (
                        <div className="p-4 md:p-8 overflow-y-auto h-full">
                            {isLoadingPackages ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {[...Array(4)].map((_, i) => <YatraCardSkeleton key={i} />)}
                                </div>
                            ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {packages.map(yatra => (
                                        <CardAnimator key={yatra.id}>
                                            <YatraCard
                                                yatra={yatra}
                                                t={t}
                                                onViewItinerary={() => openModal('yatraDetail', { yatra, t })}
                                                onViewImage={() => openModal('imageDetail', { imageUrl: yatra.imageUrl, altText: yatra.name })}
                                            />
                                        </CardAnimator>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'custom' && (
                        <div className="h-full flex flex-col md:flex-row">
                            <div className="md:w-3/5 lg:w-2/3 h-1/2 md:h-full relative">
                                {isLoadingTemples ? (
                                    <div className="absolute inset-0 flex justify-center items-center bg-stone-200">
                                        <Icon name="lotus" className="w-12 h-12 text-primary animate-spin" />
                                    </div>
                                ) : (
                                    <TempleMap 
                                        temples={allTemples} 
                                        onMarkerClick={toggleInYatraPlan}
                                        selectedTempleIds={yatraPlan.map(t => t.temple.id)}
                                    />
                                )}
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg text-sm z-10">
                                    <p>Click a temple on the map to add/remove it.</p>
                                </div>
                            </div>
                            <div className="md:w-2/5 lg:w-1/3 h-1/2 md:h-full flex flex-col">
                                <ItineraryCustomizerPanel
                                    allTemples={allTemples}
                                    itinerary={yatraPlan.map(item => item.temple)}
                                    setItinerary={handleSetItineraryFromTemples}
                                    onToggleTemple={toggleInYatraPlan}
                                    onGetQuotes={handleGetQuotes}
                                    settings={settings}
                                    setSettings={setSettings}
                                    t={t}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};