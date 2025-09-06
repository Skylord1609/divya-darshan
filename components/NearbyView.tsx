


import React, { useState, useEffect, useCallback } from 'react';
import { Temple, I18nContent, Language } from '../types';
import * as api from '../services/apiService';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../utils/geolocation';
import { TempleMap } from './TempleMap';
import { TempleCard } from './TempleCard';
import { CardAnimator } from './CardAnimator';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';

interface NearbyViewProps {
    t: I18nContent;
    language: Language;
    yatraPlan: Temple[];
    isInYatraPlan: (templeId: number) => boolean;
    onToggleYatraPlan: (temple: Temple) => void;
}

type PermissionState = 'idle' | 'loading' | 'granted' | 'denied';

export const NearbyView = ({ t, language, yatraPlan, isInYatraPlan, onToggleYatraPlan }: NearbyViewProps) => {
    const [permissionState, setPermissionState] = useState<PermissionState>('idle');
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [allTemples, setAllTemples] = useState<Temple[]>([]);
    const [nearbyTemples, setNearbyTemples] = useState<Temple[]>([]);

    const { openModal, closeModal } = useModal();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        let isCancelled = false;
        const fetchAndSetTemples = () => {
            api.getTemples(language).then(data => {
                if (!isCancelled) setAllTemples(data);
            }).catch(() => {
                if (!isCancelled) addToast("Could not load temple list", "error");
            });
        };
        
        fetchAndSetTemples();

        const handleDataUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.key === 'temples') {
                fetchAndSetTemples();
            }
        };

        window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        };
    }, [addToast, language]);

    const findNearbyTemples = useCallback((lat: number, lng: number, temples: Temple[]) => {
        const templesWithDistances = temples
            .map(temple => ({
                ...temple,
                distance: calculateDistance(lat, lng, temple.lat, temple.lng)
            }))
            .sort((a, b) => a.distance - b.distance);

        setNearbyTemples(templesWithDistances);
        setPermissionState('granted');
    }, []);

    const requestLocation = useCallback(() => {
        if (allTemples.length === 0) return;

        setPermissionState('loading');

        if (!navigator.geolocation) {
            addToast("Geolocation is not supported by your browser.", "error");
            setPermissionState('denied');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                findNearbyTemples(latitude, longitude, allTemples);
            },
            () => {
                setPermissionState('denied');
            }
        );
    }, [findNearbyTemples, allTemples, addToast]);
    

    const handleLoginOrAction = (action: () => void) => {
        if (!currentUser) openModal('login');
        else action();
    };

    const handleAdminAddTemple = async (templeData: any) => {
        if (!currentUser?.token) return;
        try {
            const result = await api.addTempleDirectly(templeData, currentUser.token);
            addToast(result.message, 'success');
            closeModal();
            // Refresh is handled by the event listener now.
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    const onAddTempleClick = () => {
        openModal('uploadTemple', {
            onSubmit: handleAdminAddTemple,
            title: t.addTemple,
            buttonText: t.addTemple,
            t
        });
    };

    const navigateTo = (path: string) => { window.location.hash = path; };

    const onSelectTemple = (templeId: number) => navigateTo(`/templeDetail/${templeId}`);
    const onBookDarshan = (temple: Temple) => handleLoginOrAction(() => openModal('darshanBooking', { temple, t }));

    const renderContent = () => {
        switch(permissionState) {
            case 'idle':
                return (
                    <div className="text-center py-20 bg-amber-100 p-8 rounded-lg">
                        <Icon name="compass" className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-orange-900">Discover Nearby Temples</h3>
                        <p className="text-stone-600 mt-2 mb-6 max-w-md mx-auto">To find sacred sites near you, please grant location access. Your location is used only for this feature and is not stored.</p>
                        <button onClick={requestLocation} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors shadow-lg">
                            Find Temples Near Me
                        </button>
                    </div>
                );
            
            case 'loading':
                return (
                    <div className="text-center py-20">
                        <Icon name="lotus" className="w-12 h-12 text-orange-500 mx-auto animate-spin mb-4" />
                        <p className="text-lg font-semibold text-orange-800">{t.findingYourLocation}</p>
                    </div>
                );

            case 'denied':
                return (
                    <div className="text-center py-20 bg-red-50 p-8 rounded-lg">
                        <h3 className="text-xl font-semibold text-red-700">Location Access Denied</h3>
                        <p className="text-stone-600 mt-2 mb-4">{t.locationPermissionDenied}</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={requestLocation} className="bg-orange-600 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-700 transition-colors">
                                Try Again
                            </button>
                        </div>
                    </div>
                );

            case 'granted':
                return (
                    <>
                        <div className="mb-8">
                            <TempleMap temples={nearbyTemples.slice(0, 20)} userLocation={userLocation!} />
                        </div>
                        {nearbyTemples.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {nearbyTemples.slice(0, 20).map(temple => (
                                     <CardAnimator key={temple.id}>
                                        <TempleCard 
                                            temple={temple} 
                                            t={t} 
                                            onSelectTemple={() => onSelectTemple(temple.id)}
                                            onBookDarshan={() => onBookDarshan(temple)}
                                            onVirtualDarshan={() => openModal('vrDarshan')}
                                            onViewImage={() => openModal('imageDetail', { imageUrl: temple.imageUrl, altText: temple.name })}
                                            onAskGuru={() => openModal('aiGuruChat', { temple })}
                                            isInYatraPlan={isInYatraPlan(temple.id)}
                                            onToggleYatraPlan={onToggleYatraPlan}
                                        />
                                    </CardAnimator>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-stone-600">
                                <h3 className="text-2xl font-semibold mb-2">No Temples Found Nearby</h3>
                                <p>We couldn't find any sacred sites within a reasonable distance.</p>
                                {currentUser?.role === 'admin' && (
                                    <button 
                                        onClick={onAddTempleClick}
                                        className="mt-6 bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <Icon name="plus" className="w-4 h-4" />
                                        <span>{t.addTemple}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                );
        }
    }

    return (
        <div className="bg-amber-50 animate-fade-in py-8 min-h-screen">
            <div className="container mx-auto px-4">
                 <div className="mb-8 flex items-center gap-3">
                    <div className="text-orange-600">
                        <Icon name="map-pin" className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-orange-900">{t.nearbyTemplesPageTitle}</h1>
                 </div>
                 {renderContent()}
            </div>
        </div>
    );
};