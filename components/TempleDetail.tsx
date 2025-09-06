import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Temple, I18nContent, Pooja, Language, Pandit } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { Section } from './Section';
import { TempleMap } from './TempleMap';
import { CrowdLevelIndicator } from './CrowdLevelIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PoojaCard } from './PoojaCard';
import { PoojaCardSkeleton } from './PoojaCardSkeleton';
import { CardAnimator } from './CardAnimator';
import { useInView } from '../hooks/useInView';
import { Icon } from './Icon';
import { calculateDistance } from '../utils/geolocation';
import { TempleCardSkeleton } from './TempleCardSkeleton';
import { TempleCard } from './TempleCard';

interface TempleDetailProps {
    templeId: string;
    t: I18nContent;
    language: Language;
    onDarshanClick: (temple: Temple) => void;
    yatraPlan: Temple[];
    isInYatraPlan: (templeId: number) => boolean;
    onToggleYatraPlan: (temple: Temple) => void;
}

export const TempleDetail = ({ templeId, t, language, onDarshanClick, yatraPlan, isInYatraPlan, onToggleYatraPlan }: TempleDetailProps) => {
    const [temple, setTemple] = useState<Temple | null>(null);
    const [poojas, setPoojas] = useState<Pooja[]>([]);
    const [allPandits, setAllPandits] = useState<Pandit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nearbyTemples, setNearbyTemples] = useState<Temple[]>([]);
    const [isNearbyLoading, setIsNearbyLoading] = useState(true);

    const { currentUser } = useAuth();
    const { openModal, closeModal } = useModal();
    const { addToast } = useToast();
    
    const { imgSrc, onError: handleImageError } = useImageWithFallback(temple?.imageUrl || '', PLACEHOLDER_IMAGE_URL);

    const poojaTitleRef = useRef<HTMLDivElement>(null);
    const isPoojaTitleVisible = useInView(poojaTitleRef, { once: true, threshold: 0.5 });


    useEffect(() => {
        let isCancelled = false;
        const numericId = parseInt(templeId, 10);

        const fetchTempleData = async () => {
            if (isCancelled || isNaN(numericId)) return;
            setIsLoading(true);
            setError(null);
            try {
                const [templeData, poojasData, panditsData] = await Promise.all([
                    api.getTempleById(numericId, language),
                    api.getPoojasByTempleId(numericId, language),
                    api.getPandits(language),
                ]);

                if (isCancelled) return;
                
                if (templeData) {
                    setTemple(templeData);
                    setPoojas(poojasData);
                    setAllPandits(panditsData);
                } else {
                    setError("Temple not found.");
                }
            } catch (err) {
                if (isCancelled) return;
                const message = err instanceof Error ? err.message : "Could not load temple data.";
                setError(message);
                addToast(message, 'error');
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        if (!isNaN(numericId)) {
            fetchTempleData();
        } else {
             setError("Invalid Temple ID.");
             setIsLoading(false);
        }
        
        const handleDataUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            const relevantKeys = ['temples', 'poojas', 'pandits'];
            if (relevantKeys.includes(customEvent.detail?.key)) {
                fetchTempleData();
            }
        };

        window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        
        return () => {
            isCancelled = true;
            window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        };
    }, [templeId, addToast, language]);
    
     useEffect(() => {
        if (!temple) return;

        let isCancelled = false;
        const fetchNearby = async () => {
            setIsNearbyLoading(true);
            try {
                const allTemples = await api.getTemples(language);
                if (isCancelled) return;

                const nearby = allTemples
                    .filter(t => t.id !== temple.id)
                    .map(t => ({
                        ...t,
                        distance: calculateDistance(temple.lat, temple.lng, t.lat, t.lng)
                    }))
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 5);
                
                if (!isCancelled) setNearbyTemples(nearby);
            } catch (err) {
                console.error("Failed to load nearby temples", err);
            } finally {
                if (!isCancelled) setIsNearbyLoading(false);
            }
        };

        fetchNearby();
        return () => { isCancelled = true; };
    }, [temple, language]);

    const handleUpdateTemple = async (templeData: Partial<Temple>) => {
        if (!currentUser?.token || !temple) return;
        try {
            const result = await api.updateTemple(temple.id, templeData, currentUser.token);
            addToast(result.message, 'success');
            closeModal();
        } catch(err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    const handlePoojaBooking = (pooja: Pooja) => {
        if (!temple) return;
        if (!currentUser) {
            openModal('login');
        } else {
            openModal('poojaBooking', { pooja, temple });
        }
    };
    
    // FIX: Add handler for asking Guru about a specific pooja.
    const handleAskGuruAboutPooja = (pooja: Pooja) => {
        openModal('aiGuruChat', { pooja });
    };

    const handlePoojaSubmit = async (poojaData: Partial<Pooja>) => {
        if (!currentUser?.token) return;
        try {
            // This handler is only for adding new poojas in this context
            const result = await api.addPooja(poojaData, currentUser.token);
            addToast(result.message, 'success');
            closeModal();
        } catch(err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    const onAddNewPooja = () => {
        if (!temple) return;
        openModal('poojaAdmin', {
            onSubmit: handlePoojaSubmit,
            preselectedTempleId: temple.id,
            t
        });
    };

    const onBack = () => window.location.hash = '#/temples';
    const onDonate = () => {
        if (!temple) return;
        if (!currentUser) {
            openModal('login');
            return;
        }
        openModal('donation', { temple });
    };
    const onEdit = () => {
        if (!temple) return;
        openModal('uploadTemple', { 
            initialData: temple,
            onSubmit: handleUpdateTemple,
            title: t.editTemple,
            buttonText: t.saveChanges,
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Icon name="lotus" className="h-16 w-16 text-primary animate-spin" /></div>;
    }

    if (error || !temple) {
        return <div className="text-center py-20 text-red-600"><h2>{error || 'Temple not found'}</h2></div>;
    }

    const cleanHistory = DOMPurify.sanitize(temple.history.replace(/\n/g, '<br />'));
    const isTempleInPlan = isInYatraPlan(temple.id);

    return (
        <div className="bg-main animate-fade-in">
            <section className="relative h-[50vh] bg-black group">
                <img src={imgSrc} alt={temple.name} loading="lazy" onError={handleImageError} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                 <button
                    onClick={() => openModal('imageDetail', { imageUrl: temple.imageUrl, altText: temple.name })}
                    aria-label={`View image of ${temple.name}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer"
                >
                    <Icon name="zoom-in" className="w-16 h-16 text-white" />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-start-val via-bg-start-val/50 to-transparent"></div>
            </section>
            <div className="container mx-auto px-4 -mt-32 relative z-10">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl">
                    <div className="flex justify-between items-start">
                        <button onClick={onBack} className="mb-6 inline-flex items-center text-primary hover:text-secondary font-bold transition-colors">
                            <Icon name="chevron-left" className="h-5 w-5 mr-2" />
                            {t.backToTemples}
                        </button>
                        {currentUser?.role === 'admin' && (
                            <button onClick={onEdit} className="mb-6 flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-700 transition-colors">
                                <Icon name="edit" className="w-4 h-4" />
                                <span>{t.editTemple}</span>
                            </button>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-2">{temple.name}</h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-text-muted mb-6">
                        <p className="flex items-center"><Icon name="map-pin" className="w-5 h-5 mr-2 text-primary"/> {temple.location}</p>
                        <p className="flex items-center"><Icon name="clock" className="w-5 h-5 mr-2 text-primary"/> {temple.darshanTimings}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <CrowdLevelIndicator level={temple.crowdLevel} size="large" />
                         <button
                            onClick={() => onToggleYatraPlan(temple)}
                            className={`w-full sm:w-auto flex-shrink-0 font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 ${
                                isTempleInPlan ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-secondary text-primary hover:bg-amber-400'
                            }`}
                        >
                            <Icon name={isTempleInPlan ? "check-circle" : "plus"} className="w-6 h-6" />
                            <span>{isTempleInPlan ? "Added to Yatra" : "Add to Yatra"}</span>
                        </button>
                        <button
                            onClick={onDonate}
                            className="w-full sm:w-auto flex-shrink-0 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Icon name="heart-hand" className="w-6 h-6" />
                            <span>{t.donateToTemple}</span>
                        </button>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-text-base" dangerouslySetInnerHTML={{ __html: cleanHistory }} />
                </div>
            </div>

            <section id="available-poojas" className="py-12 md:py-16">
                 <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div 
                        ref={poojaTitleRef}
                        className={`flex items-center section-title-animation ${isPoojaTitleVisible ? 'is-visible' : ''}`}
                        >
                        <div className="text-primary mr-3"><Icon name="bell" className="w-8 h-8" /></div>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading">{t.availablePoojas}</h2>
                        </div>
                        {currentUser?.role === 'admin' && temple && (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => openModal('manageTemplePoojas', { temple })}
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <Icon name="edit" className="w-4 h-4" />
                                    <span>{t.managePoojas}</span>
                                </button>
                                 <button 
                                    onClick={onAddNewPooja}
                                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    <Icon name="plus" className="w-4 h-4" />
                                    <span>{t.addNewPooja}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <PoojaCardSkeleton key={i} />)}</div>
                    ) : poojas.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {poojas.map(pooja => {
                                const panditCount = allPandits.filter(p => p.specialties.some(s => s.toLowerCase() === pooja.name.toLowerCase())).length;
                                return (
                                <CardAnimator key={pooja.id}>
                                    <PoojaCard 
                                        pooja={pooja} 
                                        t={t} 
                                        panditCount={panditCount}
                                        onBook={handlePoojaBooking}
                                        onViewImage={() => openModal('imageDetail', { imageUrl: pooja.imageUrl, altText: pooja.name })}
                                        onAskGuru={handleAskGuruAboutPooja}
                                    />
                                </CardAnimator>
                            )})}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-main rounded-lg">
                            <p className="text-text-base">{t.noPoojasAvailable}</p>
                        </div>
                    )}
                </div>
            </section>
            
            <Section id="nearby-sites" title="Nearby Sacred Sites" icon={<Icon name="users-group" className="w-8 h-8"/>}>
                {isNearbyLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <TempleCardSkeleton key={i} />)}
                    </div>
                ) : nearbyTemples.length > 0 ? (
                    <div className="flex overflow-x-auto space-x-6 carousel-container pb-4 -mx-4 px-4">
                        {nearbyTemples.map(nearbyTemple => (
                            <div key={nearbyTemple.id} className="w-80 flex-shrink-0">
                                <TempleCard
                                    temple={nearbyTemple}
                                    t={t}
                                    onSelectTemple={() => window.location.hash = `/templeDetail/${nearbyTemple.id}`}
                                    onBookDarshan={() => onDarshanClick(nearbyTemple)}
                                    onVirtualDarshan={() => openModal('vrDarshan')}
                                    onViewImage={() => openModal('imageDetail', {imageUrl: nearbyTemple.imageUrl, altText: nearbyTemple.name})}
                                    onAskGuru={() => openModal('aiGuruChat', { temple: nearbyTemple })}
                                    isInYatraPlan={isInYatraPlan(nearbyTemple.id)}
                                    onToggleYatraPlan={onToggleYatraPlan}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-text-muted">No other major temples found nearby in our records.</p>
                )}
            </Section>

            <Section id="temple-map" title={t.templeMap} icon={<Icon name="map-pin" className="w-8 h-8"/>}>
                <TempleMap temples={[temple]} />
            </Section>

            <button
                onClick={() => openModal('aiGuruChat', { temple })}
                className="ai-guru-fab animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
                aria-label="Ask Deva-GPT about this temple"
                title={`Ask Deva-GPT about ${temple.name}`}
            >
                <Icon name="cosmic-logo" className="w-8 h-8" />
            </button>

            <div className="h-24 bg-main"></div>
        </div>
    );
};