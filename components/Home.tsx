import React, { useState, useEffect } from 'react';
import { I18nContent, Temple, Pooja, Yatra, Book, Sloka, Testimonial, MajorEvent, Language } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SLOKA_DATA } from '../constants';
import { useHomePageData } from '../hooks/useHomePageData';
import { Icon } from './Icon';

// Components
import { Section } from './Section';
import { SlokaOfTheDay } from './SlokaOfTheDay';
import { TempleCard } from './TempleCard';
import { PoojaCard } from './PoojaCard';
import { YatraCard } from './YatraCard';
import { EventCard } from './EventCard';
import { VRDarshan } from './VRDarshan';
import { AIGuru } from './AIGuru';
import { FestivalCalendar } from './FestivalCalendar';
import { TestimonialCard } from './TestimonialCard';
import { Footer } from './Footer';
import { CardAnimator } from './CardAnimator';
import { LiveDarshanCard } from './LiveDarshanCard';
import { DonationCard } from './DonationCard';
import { FeaturedYatra } from './FeaturedYatra';
import { PersonalizedFeed } from './PersonalizedFeed';
import { CustomYatraCard } from './CustomYatraCard';
import { getDailySloka } from '../services/aiService';

// Skeletons
import { TempleCardSkeleton } from './TempleCardSkeleton';
import { PoojaCardSkeleton } from './PoojaCardSkeleton';
import { YatraCardSkeleton } from './YatraCardSkeleton';
import { EventCardSkeleton } from './EventCardSkeleton';

export interface HomeProps {
    t: I18nContent;
    language: Language;
    onDarshanClick: (temple: Temple) => void;
    yatraPlan: Temple[];
    isInYatraPlan: (templeId: number) => boolean;
    onToggleYatraPlan: (temple: Temple) => void;
}

export const Home = ({ t, language, onDarshanClick, yatraPlan, isInYatraPlan, onToggleYatraPlan }: HomeProps) => {
    const { openModal } = useModal();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { data, isLoading } = useHomePageData(language);

    const [dailySloka, setDailySloka] = useState<Sloka | null>(null);

    useEffect(() => {
        let isCancelled = false;
        getDailySloka(language).then(data => {
            if (!isCancelled) {
                setDailySloka({
                    text: data.sloka_devanagari,
                    translation: data.sloka_transliteration,
                    meaning: data.meaning,
                });
            }
        }).catch(err => {
            console.error("Failed to fetch daily sloka, using fallback.", err);
            if (!isCancelled) {
               setDailySloka(SLOKA_DATA[language][0]);
            }
        });
        return () => { isCancelled = true; };
    }, [language]);

    const handleLoginOrAction = (action: () => void) => {
        if (!currentUser) {
            openModal('login');
        } else {
            action();
        }
    };
    
    const handlePoojaBooking = (pooja: Pooja) => {
        handleLoginOrAction(() => {
            openModal('poojaBooking', { pooja });
        });
    };
    
    const handleAskGuruAboutPooja = (pooja: Pooja) => {
        openModal('aiGuruChat', { pooja });
    };

    const navigateTo = (path: string) => {
        window.location.hash = path;
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center text-white hero-bg-image bg-cover bg-center">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"></div>
                 <div className="absolute inset-0 animate-kenburns bg-cover bg-center hero-bg-image" style={{ animationDirection: 'alternate-reverse' }}></div>
                 <div className="relative z-10 p-4 md:p-8 flex flex-col items-center w-full max-w-5xl">
                    <Icon name="cosmic-logo" className="h-24 w-24 text-amber-400 animate-drop-shadow-glow-amber mb-4" />
                    <h1 className="text-6xl md:text-8xl font-bold font-serif mb-4 text-center animate-glow-white-text">{t.heroTitle}</h1>
                    <p className="text-xl md:text-2xl text-amber-100/90 text-center max-w-3xl mb-12">{t.heroSubtitle}</p>
                    {dailySloka ? (
                        <SlokaOfTheDay sloka={dailySloka} t={t} />
                    ) : (
                        <div className="bg-indigo-900/40 backdrop-blur-md border border-amber-400/30 rounded-2xl p-6 md:p-8 text-center shadow-2xl w-full min-h-[350px] flex justify-center items-center">
                            <Icon name="lotus" className="w-12 h-12 text-amber-300 animate-spin" />
                        </div>
                    )}
                    <a href="#featured-temples" className="mt-8 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-full hover:scale-105 transform transition-transform duration-300 shadow-lg flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        Explore Your Journey <Icon name="compass" className="w-5 h-5" />
                    </a>
                </div>
            </section>
            
            <div className="bg-main">

                {/* Personalized Feed */}
                <PersonalizedFeed t={t} language={language} />
                
                {/* New Yatra Planner Card */}
                <div className="container mx-auto px-4 py-8">
                    <CustomYatraCard onPlanYatra={() => navigateTo('/yatraPlanner')} />
                </div>

                {/* Featured Temples */}
                <Section id="featured-temples" title={t.featuredTemples} icon={<Icon name="temple" className="w-8 h-8"/>} onViewAll={() => navigateTo('/temples')} viewAllText={t.exploreAll}>
                     <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4">
                        {isLoading.temples ? [...Array(5)].map((_, i) => <div key={i} className="w-80 flex-shrink-0"><TempleCardSkeleton /></div>) : data.temples.slice(0, 5).map(temple => (
                            <div key={temple.id} className="w-80 flex-shrink-0">
                                <CardAnimator>
                                    <TempleCard 
                                        temple={temple} 
                                        t={t} 
                                        onSelectTemple={() => navigateTo(`/templeDetail/${temple.id}`)}
                                        onBookDarshan={() => onDarshanClick(temple)}
                                        onVirtualDarshan={() => openModal('vrDarshan')}
                                        onViewImage={() => openModal('imageDetail', {imageUrl: temple.imageUrl, altText: temple.name})}
                                        onAskGuru={() => openModal('aiGuruChat', { temple })}
                                        isInYatraPlan={isInYatraPlan(temple.id)}
                                        onToggleYatraPlan={onToggleYatraPlan}
                                    />
                                </CardAnimator>
                            </div>
                        ))}
                    </div>
                </Section>
                
                {/* Chanting Zone for Kids */}
                <div className="container mx-auto px-4 my-8">
                    <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-xl p-8 overflow-hidden flex flex-col justify-center">
                        <img src="https://www.freeiconspng.com/uploads/peace-lotus-flower-png-4.png" alt="" className="absolute -bottom-12 -right-12 w-64 h-64 opacity-20 transform rotate-12"/>
                        <div className="relative z-10 md:flex md:items-center md:gap-8 text-white text-center md:text-left">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ganesha_with_Modak.svg/512px-Ganesha_with_Modak.svg.png" alt="Smiling Ganesha" className="w-40 h-40 mx-auto md:mx-0 mb-4 md:mb-0" />
                            <div>
                                <h3 className="text-3xl font-bold font-kid-friendly mb-2">{t.chantingZoneForKids}</h3>
                                <p className="mb-6 opacity-90">{t.chantingZoneSubtitle}</p>
                                <button
                                    onClick={() => navigateTo('/chantingZone')}
                                    className="bg-white text-purple-600 font-bold font-kid-friendly py-3 px-8 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    {t.chantNow}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Pilgrimage of the Month */}
                <div className="container mx-auto px-4">
                   <FeaturedYatra t={t} onExplore={() => navigateTo('/yatras')} />
                </div>
                
                {/* Major Events */}
                <Section id="major-events" title={t.majorEvents} icon={<Icon name="users-group" className="w-8 h-8"/>} onViewAll={() => navigateTo('/events')} viewAllText={t.viewAll}>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {isLoading.events ? [...Array(2)].map((_, i) => <EventCardSkeleton key={i} />) : data.events.slice(0, 2).map(event => (
                            <CardAnimator key={event.id}>
                                <EventCard 
                                    event={event} 
                                    t={t} 
                                    onSelectEvent={() => navigateTo(`/eventDetail/${event.id}`)} 
                                    onViewImage={() => openModal('imageDetail', { imageUrl: event.imageUrl, altText: event.name })}
                                />
                            </CardAnimator>
                        ))}
                    </div>
                </Section>

                {/* Explore Poojas */}
                <Section id="explore-poojas" title={t.explorePoojas} icon={<Icon name="bell" className="w-8 h-8"/>} onViewAll={() => navigateTo('/poojas')} viewAllText={t.exploreAll}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading.poojas ? [...Array(4)].map((_, i) => <PoojaCardSkeleton key={i} />) : data.poojas.slice(0, 4).map(pooja => (
                            <CardAnimator key={pooja.id}>
                                <PoojaCard 
                                    pooja={pooja} 
                                    t={t} 
                                    onBook={handlePoojaBooking}
                                    onViewImage={() => openModal('imageDetail', { imageUrl: pooja.imageUrl, altText: pooja.name })}
                                    onAskGuru={handleAskGuruAboutPooja}
                                />
                            </CardAnimator>
                        ))}
                    </div>
                </Section>

                {/* Yatra Packages */}
                <Section id="yatra-packages" title={t.yatraPackages} icon={<Icon name="compass" className="w-8 h-8"/>} onViewAll={() => navigateTo('/yatras')} viewAllText={t.viewAll}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {isLoading.yatras ? [...Array(4)].map((_, i) => <YatraCardSkeleton key={i} />) : data.yatras.slice(0, 4).map(yatra => (
                            <CardAnimator key={yatra.id}>
                                <YatraCard 
                                    yatra={yatra} 
                                    t={t} 
                                    onViewItinerary={() => openModal('yatraDetail', { yatra })} 
                                    onViewImage={() => openModal('imageDetail', { imageUrl: yatra.imageUrl, altText: yatra.name })}
                                />
                            </CardAnimator>
                        ))}
                    </div>
                </Section>
                
                {/* Immersive Experiences Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <LiveDarshanCard title={t.liveDarshanTitle} description="From Ganga Aarti in Varanasi to your screen." buttonText={t.liveDarshanButton} onClick={() => openModal('liveDarshan')} />
                        <VRDarshan t={t} onClick={() => openModal('vrDarshan')} />
                    </div>
                </div>

                {/* AI Guru */}
                <Section id="ai-guru" title={t.aiGuruTitle} icon={<Icon name="cosmic-logo" className="w-8 h-8 text-primary"/>}>
                    <AIGuru t={t} />
                </Section>
                
                {/* Forgotten Temple */}
                <section className="relative bg-stone-800 text-white py-20 overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-repeat"
                        style={{
                            backgroundImage: `url('https://www.transparenttextures.com/patterns/az-subtle.png')`,
                            opacity: 0.05
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-800 to-stone-800/80"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-bold font-heading mb-4 text-primary animate-fade-in-up" style={{ animationDelay: '0.2s' }}>{t.forgottenTempleTitle}</h2>
                                <p className="text-lg text-white/80 mb-8 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>{t.forgottenTempleDesc}</p>
                                <button 
                                    onClick={() => handleLoginOrAction(() => openModal('uploadTemple'))}
                                    className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 animate-fade-in-up mx-auto md:mx-0"
                                    style={{ animationDelay: '0.6s' }}
                                >
                                    <Icon name="upload" className="w-5 h-5"/>
                                   {t.uploadTemple}
                                </button>
                            </div>
                            <div className="relative flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <div className="flex gap-2 p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                                    {/* Ruined Temple */}
                                    <div className="w-40 h-40 bg-cover bg-center rounded-md border-2 border-stone-500 relative" style={{backgroundImage: `url('https://images.unsplash.com/photo-1587895259837-2637b51e133e?q=80&w=800')`}}>
                                        <div className="absolute inset-0 bg-black/50"></div>
                                        <span className="absolute bottom-2 left-2 text-white font-bold text-sm bg-black/50 px-1 rounded">Before</span>
                                    </div>
                                    {/* Restored Temple */}
                                    <div className="w-40 h-40 bg-cover bg-center rounded-md border-2 border-primary relative" style={{backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Somnath_Temple_At_Sunset_2.jpg/1280px-Somnath_Temple_At_Sunset_2.jpg')`}}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <span className="absolute bottom-2 left-2 text-white font-bold text-sm bg-black/50 px-1 rounded">After</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Seva Section */}
                <Section id="seva" title={t.sevaTitle} icon={<Icon name="heart-hand" className="w-8 h-8"/>}>
                    <DonationCard t={t} onDonate={() => handleLoginOrAction(() => openModal('donation'))} />
                </Section>
                
                {/* Festivals */}
                <Section id="festivals" title={t.festivalsTitle} icon={<Icon name="calendar" className="w-8 h-8"/>}>
                    <FestivalCalendar t={t} />
                </Section>
                
                {/* Testimonials */}
                <Section id="testimonials" title="Words from Devotees" icon={<Icon name="users-group" className="w-8 h-8"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {isLoading.testimonials ? [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white rounded-xl shadow-lg animate-pulse"></div>) : data.testimonials.map(testimonial => (
                            <CardAnimator key={testimonial.id}>
                                <TestimonialCard testimonial={testimonial} />
                            </CardAnimator>
                        ))}
                    </div>
                </Section>
            </div>
            
            <Footer t={t} />
        </>
    );
};