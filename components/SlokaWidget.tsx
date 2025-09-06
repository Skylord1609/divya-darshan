// This file is repurposed to house the new "Bhakti Chanting Zone" feature for all ages.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { I18nContent, Chant, User, Badge } from '../types';
import { CHANTS_DATA, CHANTING_BADGES_DATA, PLACEHOLDER_IMAGE_URL } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiService';

type ViewMode = 'kids' | 'sadhana';
type KidsMode = 'chantAlong' | 'repeatLearn';
type ChantState = 'idle' | 'guru' | 'user' | 'recording' | 'playing';

// --- Japa Mala Component for Sadhana Mode ---
const JapaMala = ({ chant, onComplete, t }: { chant: Chant; onComplete: () => void; t: I18nContent }) => {
    const [japaCount, setJapaCount] = useState(0);
    const beadRef = useRef<HTMLButtonElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/switches/switch_1.ogg");
        audioRef.current.volume = 0.5;
    }, []);

    const handleBeadPress = () => {
        if (japaCount < 108) {
            setJapaCount(count => count + 1);
            beadRef.current?.classList.add('bead-press-anim');
            setTimeout(() => beadRef.current?.classList.remove('bead-press-anim'), 150);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Bead sound failed:", e));
            }
        }
    };
    
    const handleComplete = () => {
        if (japaCount >= 108) {
            onComplete();
            setJapaCount(0);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <style>{`
                .bead-press-anim { animation: bead-press 0.15s ease-in-out; }
                @keyframes bead-press {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.9); }
                }
            `}</style>
            <p className="font-noto-serif text-3xl md:text-5xl text-center text-primary mb-6">{chant.sanskrit}</p>
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-secondary/20" strokeWidth="5" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle 
                        className="text-secondary" 
                        strokeWidth="5" 
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={(2 * Math.PI * 45) * (1 - japaCount / 108)}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.2s linear' }}
                    />
                </svg>
                <button ref={beadRef} onClick={handleBeadPress} className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl flex flex-col items-center justify-center text-amber-900 focus:outline-none focus:ring-4 ring-primary ring-offset-4 ring-offset-main">
                    <span className="font-bold text-5xl md:text-7xl">{japaCount}</span>
                    <span className="text-sm">/ 108</span>
                </button>
            </div>
            <p className="text-text-muted mt-4">{t.japaMalaProgress}</p>
            <button
                onClick={handleComplete}
                disabled={japaCount < 108}
                className="mt-6 bg-primary text-white font-bold text-lg px-10 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {t.completeMala}
            </button>
        </div>
    );
};


const AnimatedDeity = ({ chant, currentUser }: { chant: Chant; currentUser: User | null; }) => {
    const [customImage, setCustomImage] = useState<string | null>(null);
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCustomImage(null);
        if (currentUser) {
            api.getUserPreferences(currentUser.id).then(prefs => {
                if (prefs.chantImages && prefs.chantImages[chant.id]) {
                    setCustomImage(prefs.chantImages[chant.id]);
                }
            });
        }
    }, [chant.id, currentUser]);

    const { imgSrc, status } = useImageWithFallback(customImage || chant.deityImage, PLACEHOLDER_IMAGE_URL);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentUser) return;
        const file = event.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
                addToast(`Invalid file. Max 2MB JPG, PNG, or WebP.`, 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await api.updateUserChantImage(currentUser.id, chant.id, reader.result as string);
                    setCustomImage(reader.result as string);
                    addToast(`${chant.deity} image updated.`, 'success');
                } catch (error) {
                    addToast(error instanceof Error ? error.message : 'Could not save image.', 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileUpload = () => {
        if (!currentUser) {
            addToast('Login to customize images.', 'info');
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <div className="group relative w-48 h-48 md:w-64 md:h-64 mb-4 animate-deity-breathe">
            <img 
                src={imgSrc} 
                alt={chant.deity} 
                className={`w-full h-full object-contain drop-shadow-2xl transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
            />
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" disabled={!currentUser} />
            <button onClick={triggerFileUpload} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full disabled:cursor-not-allowed" aria-label={`Upload custom image for ${chant.deity}`} disabled={!currentUser} title={!currentUser ? 'Login to upload an image' : `Upload custom image for ${chant.deity}`}>
                <Icon name="upload" className="w-10 h-10" />
            </button>
        </div>
    );
};


export const ChantingZone = ({ t }: { t: I18nContent }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('kids');
    const [selectedChant, setSelectedChant] = useState<Chant>(CHANTS_DATA[0]);
    
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    // Kids Zone State
    const [kidsMode, setKidsMode] = useState<KidsMode>('chantAlong');
    const [chantCount, setChantCount] = useState(() => { try { const s = localStorage.getItem('dd-chant-count'); return s ? parseInt(s,10) : 0; } catch { return 0; }});
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
    const [chantState, setChantState] = useState<ChantState>('idle');
    const [currentLine, setCurrentLine] = useState(0);

    // Shared Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioUrlRef = useRef<string | null>(null);
    const synthRef = useRef(window.speechSynthesis);

    // --- API Integration ---
    const handleCompleteSadhana = async () => {
        if (!currentUser) {
            addToast("Please log in to save your progress.", 'info');
            return;
        }
        try {
            await api.completeSpiritualTask(currentUser.id, 'chant');
            addToast(t.malaCompletedMessage, 'success');
        } catch(err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    // --- Kids Mode Badge Logic ---
    useEffect(() => {
        localStorage.setItem('dd-chant-count', String(chantCount));
        const newlyUnlocked = CHANTING_BADGES_DATA.filter(badge => chantCount >= badge.chantCount && !unlockedBadges.includes(badge.id));
        if (newlyUnlocked.length > 0) {
            setUnlockedBadges(prev => [...prev, ...newlyUnlocked.map(b => b.id)]);
            newlyUnlocked.forEach(badge => addToast(`${t.achievementUnlocked} ${t[badge.nameKey as keyof I18nContent]}!`, 'success'));
        }
    }, [chantCount, unlockedBadges, addToast, t]);

    // --- Kids Mode Audio Logic ---
    const stopAllAudio = useCallback(() => {
        if (synthRef.current.speaking) synthRef.current.cancel();
    }, []);

    useEffect(() => {
        return () => {
            stopAllAudio();
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current.stop();
            }
        };
    }, [stopAllAudio]);

    const speak = useCallback((text: string, onEnd: () => void) => {
        stopAllAudio(); // Ensure any previous speech is stopped.
        const doSpeak = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = synthRef.current.getVoices();
            utterance.voice = voices.find(v => v.lang.startsWith('hi-IN')) || voices.find(v => v.lang.startsWith('en-IN')) || null;
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            utterance.onend = onEnd;
            synthRef.current.speak(utterance);
        };
        if (synthRef.current.getVoices().length === 0) synthRef.current.onvoiceschanged = doSpeak;
        else doSpeak();
    }, [stopAllAudio]);
    
    const handleKidChantCompletion = useCallback(() => {
        setChantState('idle');
        setChantCount(prev => prev + 1);
    }, []);

    const startChantAlong = useCallback(() => {
        setChantState('guru');
        setCurrentLine(0);
    }, []);

    useEffect(() => {
        if (kidsMode !== 'chantAlong' || chantState !== 'guru' || currentLine >= selectedChant.mantra.length) {
            return;
        }

        speak(selectedChant.mantra[currentLine], () => {
            setChantState('user');
            setTimeout(() => {
                 if(currentLine + 1 < selectedChant.mantra.length) {
                    setCurrentLine(prev => prev + 1);
                    setChantState('guru');
                } else {
                    handleKidChantCompletion();
                }
            }, 3000);
        });
    }, [kidsMode, chantState, currentLine, selectedChant.mantra, speak, handleKidChantCompletion]);

    const startRepeatLearn = () => {
        setChantState('guru');
        speak(selectedChant.mantra.join(' '), () => setChantState('user'));
    };

    const startRecording = async () => {
        if (chantState !== 'user') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType });
                if(audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = URL.createObjectURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                setChantState('playing');
            };
            mediaRecorderRef.current.start();
            setChantState('recording');
        } catch (err) {
            addToast("Microphone access is needed.", 'error');
            setChantState('user');
        }
    };
    const stopRecording = () => mediaRecorderRef.current?.stop();
    const playRecording = () => {
        if (audioUrlRef.current) {
            const audio = new Audio(audioUrlRef.current);
            audio.play();
            audio.onended = handleKidChantCompletion;
        }
    };

    const handleMainButtonClick = () => {
        if (chantState !== 'idle') {
            stopAllAudio();
            setChantState('idle');
            return;
        }
        if (kidsMode === 'chantAlong') startChantAlong();
        if (kidsMode === 'repeatLearn') startRepeatLearn();
    };

    const handleChantSelection = (chant: Chant) => {
        stopAllAudio();
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        setSelectedChant(chant);
        setChantState('idle');
        setCurrentLine(0);
    };
    
    const chantStatusText = () => {
        switch(chantState) {
            case 'guru': return `${selectedChant.deity} is chanting...`;
            case 'user': return t.yourTurn;
            case 'recording': return t.recording;
            case 'playing': return t.greatJob;
            default: return `Chant with ${selectedChant.deity}!`;
        }
    };

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 text-center bg-main">
            <header className="w-full max-w-4xl mx-auto mb-6">
                <h1 className="text-4xl md:text-6xl font-bold text-text-base drop-shadow-lg">{t.chantingZoneTitle}</h1>
                <div className="mt-4 bg-white/60 backdrop-blur-sm p-2 rounded-full shadow-inner inline-flex gap-2">
                    <button onClick={() => setViewMode('kids')} className={`px-4 py-2 rounded-full font-bold transition-all text-text-base ${viewMode === 'kids' ? 'bg-yellow-400 shadow-md scale-105 font-kid-friendly' : 'bg-white/50'}`}>{t.chantingZoneKidsMode}</button>
                    <button onClick={() => setViewMode('sadhana')} className={`px-4 py-2 rounded-full font-bold transition-all text-text-base ${viewMode === 'sadhana' ? 'bg-yellow-400 shadow-md scale-105' : 'bg-white/50'}`}>{t.chantingZoneSadhanaMode}</button>
                </div>
            </header>

            <div className="w-full max-w-4xl mx-auto animate-fade-in">
                {viewMode === 'kids' && (
                     <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center font-kid-friendly">
                        <div className="flex justify-center gap-2 mb-4">
                            <button onClick={() => setKidsMode('chantAlong')} className={`px-4 py-2 rounded-full font-bold transition-all text-text-base ${kidsMode === 'chantAlong' ? 'bg-yellow-400 shadow-md' : 'bg-white/50'}`}>{t.chantAlongMode}</button>
                            <button onClick={() => setKidsMode('repeatLearn')} className={`px-4 py-2 rounded-full font-bold transition-all text-text-base ${kidsMode === 'repeatLearn' ? 'bg-yellow-400 shadow-md' : 'bg-white/50'}`}>{t.repeatLearnMode}</button>
                        </div>
                        <AnimatedDeity chant={selectedChant} currentUser={currentUser} />
                        <div className="text-3xl md:text-5xl font-bold text-primary mb-4 h-32 flex items-center justify-center p-4">
                            <p className="font-noto-serif">{selectedChant.sanskrit}</p>
                        </div>
                        <div className="h-8 mb-4 text-text-base font-semibold text-lg">{chantStatusText()}</div>
                        {/* Interaction Buttons */}
                        <div className="flex items-center gap-4">
                            {kidsMode === 'chantAlong' && <button onClick={handleMainButtonClick} className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-2xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-transform">{chantState === 'idle' ? t.chantNow : 'Stop'}</button>}
                            {kidsMode === 'repeatLearn' && (chantState === 'user' ? <button onClick={startRecording} className="bg-red-500 text-white font-bold text-xl px-8 py-3 rounded-full shadow-lg flex items-center gap-2"><Icon name="microphone" className="w-6 h-6" /> {t.recordYourVoice}</button> : chantState === 'recording' ? <button onClick={stopRecording} className="bg-red-600 text-white font-bold text-xl px-8 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse"><Icon name="stop-circle" className="w-6 h-6" /> {t.stopRecording}</button> : chantState === 'playing' ? <button onClick={playRecording} className="bg-green-500 text-white font-bold text-xl px-8 py-3 rounded-full shadow-lg flex items-center gap-2"><Icon name="play" className="w-6 h-6" /> {t.playYourChant}</button> : <button onClick={handleMainButtonClick} className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-2xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-transform">{chantState === 'idle' ? <Icon name="speaker" className="w-8 h-8"/> : 'Stop'}</button>)}
                        </div>
                        <div className="mt-8 w-full">
                            <p className="font-bold text-lg">{t.chantCountLabel}: <span className="text-2xl text-primary">{chantCount}</span></p>
                            <h4 className="font-bold text-lg mt-2">{t.badgeCollection}</h4>
                            <div className="flex justify-center gap-4 mt-2">
                               {CHANTING_BADGES_DATA.map(badge => <div key={badge.id} className={`p-2 rounded-full ${chantCount >= badge.chantCount ? 'bg-amber-200' : 'bg-stone-200 grayscale opacity-70'}`} title={`${t[badge.nameKey as keyof I18nContent]}: ${t[badge.descriptionKey as keyof I18nContent]}`}><Icon name={badge.icon} className="w-8 h-8 text-amber-700" /></div>)}
                            </div>
                        </div>
                    </div>
                )}
                {viewMode === 'sadhana' && (
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center">
                        <h2 className="text-3xl font-bold font-heading text-text-base">{t.sadhanaModeTitle}</h2>
                        <p className="text-text-muted mb-4">{t.sadhanaModeSubtitle}</p>
                        <select onChange={(e) => handleChantSelection(CHANTS_DATA.find(c => c.id === parseInt(e.target.value))!)} value={selectedChant.id} className="mb-4 p-2 rounded-lg border-2 border-secondary bg-white font-semibold">
                            {CHANTS_DATA.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <JapaMala chant={selectedChant} onComplete={handleCompleteSadhana} t={t} />
                    </div>
                )}
            </div>
        </div>
    );
};
