
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, I18nContent, SpiritualGrowthData, LifetimeStats, TaskType, ChakraTheme } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { DailyTasks } from './DailyTasks';
import { StatCard } from './StatCard';
import { Icon } from './Icon';
import { ACHIEVEMENTS_DATA, CHAKRA_DATA, CHAKRA_MEDITATION_DATA } from '../constants';
import { AchievementCard } from './AchievementCard';
import { useTheme } from '../contexts/ThemeContext';

interface ChakraSanctuaryProps {
    user: User | null;
    t: I18nContent;
}

const levelToChakraMap: { [level: number]: string } = {
    1: 'Muladhara', 2: 'Muladhara',
    3: 'Swadhisthana', 4: 'Swadhisthana',
    5: 'Manipura', 6: 'Manipura',
    7: 'Anahata', 8: 'Anahata',
    9: 'Vishuddha', 10: 'Vishuddha',
    11: 'Ajna', 12: 'Ajna',
};

const getChakraForLevel = (level: number): ChakraTheme => {
    const chakraName = levelToChakraMap[level] || 'Sahasrara';
    return CHAKRA_DATA.find(c => c.name === chakraName)!;
};

const hexToRgbVal = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : null;
};

const SanctuarySkeleton = () => (
    <div className="animate-pulse w-full h-full flex items-center justify-center">
        <div className="w-96 h-96 bg-gray-300/20 rounded-full"></div>
    </div>
);


export const ChakraSanctuary = ({ user, t }: ChakraSanctuaryProps) => {
    const [growthData, setGrowthData] = useState<SpiritualGrowthData | null>(null);
    const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeChakraId, setActiveChakraId] = useState<number | null>(null);
    const [isGuidedMode, setIsGuidedMode] = useState(false);
    const [guidedIndex, setGuidedIndex] = useState(0);
    const [narration, setNarration] = useState<{ mantra: string; text: string; } | null>(null);
    const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);

    const { addToast } = useToast();
    const { setTheme } = useTheme();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const synthRef = useRef(window.speechSynthesis);
    const guidedModeTimer = useRef<number | null>(null);

    const stopAll = useCallback(() => {
        setIsGuidedMode(false);
        setActiveChakraId(null);
        setGuidedIndex(0);
        setNarration(null);
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }
        if (guidedModeTimer.current) {
            clearTimeout(guidedModeTimer.current);
            guidedModeTimer.current = null;
        }
    }, []);

    useEffect(() => {
        audioRef.current = new Audio();
        // Return a cleanup function for component unmount
        return () => {
            stopAll();
        };
    }, [stopAll]);

    const playChakraSequence = useCallback((chakraId: number) => {
        const chakra = CHAKRA_MEDITATION_DATA.find(c => c.id === chakraId);
        if (!chakra) return;
        
        stopAll();
        setTheme(chakra.themeName);
        
        setActiveChakraId(chakra.id);
        setNarration({ mantra: chakra.mantra, text: `${chakra.name}: ${chakra.voiceover}` });

        if (audioRef.current) {
            audioRef.current.src = chakra.audioUrl;
            audioRef.current.load(); // Explicitly load the new source
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                        if (e.name !== 'AbortError') {
                        console.error(`Audio failed for ${chakra.name}:`, e);
                    }
                });
            }
        }
        
        const utterance = new SpeechSynthesisUtterance(chakra.voiceover);
        const voices = synthRef.current.getVoices();
        utterance.voice = voices.find(v => v.lang.startsWith('en-IN')) || voices.find(v => v.lang.startsWith('en-US')) || null;
        utterance.rate = 0.9;
        synthRef.current.speak(utterance);
    }, [stopAll, setTheme]);


    const handleChakraClick = (chakraId: number) => {
        if (isGuidedMode) stopAll();
        playChakraSequence(chakraId);
    };

    const startGuidedMode = () => {
        stopAll();
        setIsGuidedMode(true);
        setGuidedIndex(1);
    };
    
    useEffect(() => {
        if (isGuidedMode && guidedIndex > 0 && guidedIndex <= CHAKRA_MEDITATION_DATA.length) {
            playChakraSequence(guidedIndex);
            guidedModeTimer.current = window.setTimeout(() => {
                setGuidedIndex(prev => prev + 1);
            }, 7000);

            return () => { if (guidedModeTimer.current) clearTimeout(guidedModeTimer.current) };
        } else if (isGuidedMode && guidedIndex > CHAKRA_MEDITATION_DATA.length) {
            stopAll();
        }
    }, [isGuidedMode, guidedIndex, playChakraSequence, stopAll]);

    useEffect(() => {
        if (user) {
            const fetchJourneyData = async () => {
                setIsLoading(true);
                try {
                    const [growth, stats] = await Promise.all([
                        api.checkAndResetStreak(user.id),
                        api.getLifetimeStats(user.id)
                    ]);
                    setGrowthData(growth);
                    setLifetimeStats(stats);
                } catch (error) {
                    if (error instanceof Error) addToast(`Failed to load journey: ${error.message}`, 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchJourneyData();
        } else {
            setIsLoading(false);
            setGrowthData(null);
            setLifetimeStats(null);
        }
    }, [user, addToast]);
    
    const handleToggleTask = async (taskType: TaskType) => {
        if (!user) return;
        try {
            const updatedData = await api.completeSpiritualTask(user.id, taskType);
            setGrowthData(updatedData);
            addToast(`Task completed! +50 XP`, 'success');
        } catch (error) {
            if (error instanceof Error) addToast(error.message, 'error');
        }
    };

    const unlockedChakra = growthData ? getChakraForLevel(growthData.level) : null;
    const unlockedChakraId = unlockedChakra ? unlockedChakra.id : 0;

    const activeChakraColor = activeChakraId ? CHAKRA_MEDITATION_DATA.find(c => c.id === activeChakraId)?.color : 'white';

    return (
        <div className="relative h-full w-full bg-[#090a0f] chakra-activation-container flex flex-col items-center justify-center text-white overflow-hidden p-4">
            {/* Meditating Figure and Chakras */}
            <div className="relative w-full h-[80vh] max-w-lg flex items-center justify-center">
                <div className="absolute top-[25%] bottom-[15%] left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-white/0 via-white/30 to-white/0 animate-sushumna-flow" style={{ backgroundSize: '100% 20%' }} />
                
                {CHAKRA_MEDITATION_DATA.map(chakra => {
                    const isActive = activeChakraId === chakra.id;
                    const buttonStyle: React.CSSProperties = {
                        borderColor: isActive ? chakra.color : (unlockedChakraId >= chakra.id || !user ? chakra.color : 'rgba(255,255,255,0.5)'),
                        color: chakra.color,
                    };

                    if (isActive && chakra.color) {
                        const rgbVal = hexToRgbVal(chakra.color);
                        if (rgbVal) {
                            buttonStyle['--active-chakra-color-val'] = rgbVal;
                        }
                    }

                    return (
                        <div key={chakra.id} className="absolute left-1/2 -translate-x-1/2" style={{ top: chakra.top }}>
                            <div className={`relative w-16 h-16 flex items-center justify-center ${isActive ? chakra.animationClass : ''}`}>
                                <div className="energy-visual" style={{ backgroundColor: chakra.color, boxShadow: `0 0 50px 20px ${chakra.color}` }}></div>
                                <button
                                    onClick={() => handleChakraClick(chakra.id)}
                                    className={`relative z-10 w-10 h-10 rounded-full border-2 bg-black/30 flex items-center justify-center transition-all duration-300 chakra-point ${unlockedChakraId >= chakra.id || !user ? 'chakra-point-unlocked' : ''} ${isActive ? 'animate-active-chakra-glow' : ''}`}
                                    style={buttonStyle}
                                >
                                    <img src={chakra.symbol} alt={`${chakra.name} symbol`} className="w-8 h-8 invert brightness-200" />
                                </button>
                            </div>
                        </div>
                    )
                })}
                {isLoading && user && <SanctuarySkeleton />}
            </div>

            {/* Narration and Controls */}
            <div className="absolute bottom-4 w-full max-w-3xl text-center space-y-4 px-4">
                 <div className="h-20 text-lg font-semibold flex flex-col items-center justify-center p-2 rounded-lg bg-black/20 backdrop-blur-sm transition-colors duration-500" style={{ color: activeChakraColor }}>
                    {narration ? (
                        <div className="animate-fade-in">
                            <p className="text-4xl font-bold font-noto-serif">{narration.mantra}</p>
                            <p className="text-sm mt-1 opacity-90">{narration.text}</p>
                        </div>
                    ) : (
                        <p className="animate-fade-in">Tap a chakra to activate & change theme, or begin a guided journey.</p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user && (
                        <button onClick={() => setIsStatsPanelOpen(!isStatsPanelOpen)} className="w-full sm:w-auto bg-white/10 text-white font-bold px-8 py-3 rounded-full hover:bg-white/20 transition-colors shadow-lg">
                            View Progress
                        </button>
                    )}
                    {!isGuidedMode ? (
                        <button onClick={startGuidedMode} className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-secondary transition-colors shadow-lg">
                            Start Guided Meditation
                        </button>
                    ) : (
                        <button onClick={stopAll} className="w-full sm:w-auto bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition-colors shadow-lg">
                            Stop Meditation
                        </button>
                    )}
                </div>
            </div>
            
            {/* Stats Panel */}
            <div className={`absolute inset-0 bg-black/80 z-30 transition-opacity duration-300 ${isStatsPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsStatsPanelOpen(false)}></div>
            <div className={`absolute bottom-0 left-0 right-0 z-40 bg-main text-text-base p-4 rounded-t-2xl shadow-2xl transition-transform duration-500 ease-in-out-cubic max-h-[85vh] overflow-y-auto ${isStatsPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="container mx-auto max-w-4xl">
                    <button onClick={() => setIsStatsPanelOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-primary">&times;</button>
                     <h2 className="text-3xl font-bold font-heading mb-4 text-center">{t.chakraSanctuaryTitle}</h2>
                     {growthData && lifetimeStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-bold font-heading mb-2">{t.dailySadhana}</h3>
                                <DailyTasks tasks={growthData.dailyTasks} onToggleTask={handleToggleTask} t={t} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-heading mb-2">{t.lifetimeStats}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard title={t.templesVisited} value={lifetimeStats.templesVisited} icon={<Icon name="temple" className="w-6 h-6"/>} />
                                    <StatCard title={t.poojasBooked} value={lifetimeStats.poojasBooked} icon={<Icon name="bell" className="w-6 h-6"/>} />
                                    <StatCard title={t.sevaOffered} value={lifetimeStats.sevaOffered} icon={<Icon name="heart-hand" className="w-6 h-6"/>} />
                                    <StatCard title={t.knowledgeRead} value={lifetimeStats.knowledgeRead} icon={<Icon name="book-open" className="w-6 h-6"/>} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-bold font-heading mb-2">{t.achievements}</h3>
                                 <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                     {ACHIEVEMENTS_DATA.map(ach => (
                                        <AchievementCard key={ach.id} achievement={ach} unlocked={ach.condition(lifetimeStats, growthData)} t={t} />
                                    ))}
                                 </div>
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};
