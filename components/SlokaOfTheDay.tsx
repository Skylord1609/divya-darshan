import React, { useState, useEffect, useRef } from 'react';
import { Sloka, I18nContent } from '../types';
import { explainScripture, getDailySloka } from '../services/aiService';
import { Icon } from './Icon';

interface SlokaOfTheDayProps {
    sloka: Sloka;
    t: I18nContent;
}

export const SlokaOfTheDay = ({ sloka, t }: SlokaOfTheDayProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    
    const synthRef = useRef(window.speechSynthesis);
    const isSpeechSupported = !!synthRef.current;

    useEffect(() => {
        // Cleanup speech synthesis on component unmount or when the sloka changes
        const synth = synthRef.current;
        return () => {
            if (synth?.speaking) {
                synth.cancel();
            }
            setIsSpeaking(false);
            setShowExplanation(false);
            setExplanation('');
        };
    }, [sloka]);

    const handleListen = () => {
        const synth = synthRef.current;
        if (!isSpeechSupported || !synth) return;

        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        const speak = () => {
            const allVoices = synth.getVoices();
            if (allVoices.length === 0) {
                console.error("No voices available for speech synthesis.");
                // Potentially show a toast to the user
                return;
            }

            // --- Sanskrit utterance ---
            const utteranceSanskrit = new SpeechSynthesisUtterance(sloka.text);
            utteranceSanskrit.lang = 'hi-IN';
            utteranceSanskrit.rate = 0.8;
            // Find the best available Hindi voice
            const hindiVoice = allVoices.find(voice => voice.lang === 'hi-IN' && voice.name.includes('Google')) || allVoices.find(voice => voice.lang === 'hi-IN');
            if (hindiVoice) {
                utteranceSanskrit.voice = hindiVoice;
            }

            // --- English meaning utterance ---
            const utteranceMeaning = new SpeechSynthesisUtterance(sloka.meaning);
            utteranceMeaning.lang = 'en-US';
            utteranceMeaning.rate = 0.9;
            // Find the best available English voice
            const englishVoice = allVoices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google')) || allVoices.find(voice => voice.lang.startsWith('en-'));
            if (englishVoice) {
                utteranceMeaning.voice = englishVoice;
            }
            
            // --- Event Handlers ---
            utteranceSanskrit.onstart = () => setIsSpeaking(true);
            
            utteranceSanskrit.onend = () => {
                // Check if cancel() was called, which stops the synth
                if (synth.speaking) {
                   synth.speak(utteranceMeaning);
                } else {
                   // This case happens if the user presses "Stop" during the Sanskrit part
                   setIsSpeaking(false);
                }
            };
            
            utteranceMeaning.onend = () => setIsSpeaking(false);
            
            const onError = (event: SpeechSynthesisErrorEvent) => {
                console.error(`Speech synthesis error:`, event.error);
                setIsSpeaking(false);
            }
            utteranceSanskrit.onerror = onError;
            utteranceMeaning.onerror = onError;
            
            // Start speaking
            synth.speak(utteranceSanskrit);
        };
        
        // Voices may load asynchronously. If they aren't loaded, wait for the `voiceschanged` event.
        if (synth.getVoices().length === 0) {
            synth.onvoiceschanged = speak;
        } else {
            speak();
        }
    };

    const handleExplainDeeper = async () => {
        if (!showExplanation && !explanation) { // Fetch only if not already fetched
            setIsExplaining(true);
            setShowExplanation(true);
            try {
                const prompt = `this sloka: "${sloka.text}" which is transliterated as "${sloka.translation}" and means "${sloka.meaning}"`;
                const result = await explainScripture(prompt);
                setExplanation(result);
            } catch (error) {
                console.error("Failed to get explanation", error);
                setExplanation("Sorry, the Guru could not provide a deeper explanation at this time. Please try again later.");
            } finally {
                setIsExplaining(false);
            }
        } else {
             setShowExplanation(!showExplanation);
        }
    };

    return (
        <div className="bg-indigo-900/40 backdrop-blur-md border border-amber-400/30 rounded-2xl p-6 md:p-8 text-center animate-fade-in-up shadow-2xl w-full">
            <div className="flex justify-center items-center mb-4">
              <Icon name="lotus" className="h-10 w-10 text-amber-300" />
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mx-4">{t.dailySloka}</h2>
              <Icon name="om" className="h-8 w-8 text-amber-300" />
            </div>
            <p className="font-noto-serif text-2xl md:text-3xl leading-relaxed whitespace-pre-line text-amber-400 mb-6" style={{ fontFamily: "'Noto Serif', serif" }}>
                {sloka.text}
            </p>
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-amber-200">{t.translation}</h4>
                    <p className="text-amber-100 italic whitespace-pre-line">{sloka.translation}</p>
                </div>
                <div>
                    <h4 className="font-bold text-amber-200">{t.meaning}</h4>
                    <p className="text-amber-100 italic max-w-3xl mx-auto">{sloka.meaning}</p>
                </div>
            </div>
             <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleListen}
                    disabled={!isSpeechSupported}
                    title={!isSpeechSupported ? "Speech synthesis is not supported in your browser." : (isSpeaking ? 'Stop Speaking' : 'Listen to Sloka')}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500/20 text-amber-200 rounded-full hover:bg-amber-500/40 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon name="speaker" className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    <span>{isSpeaking ? 'Stop' : t.listen}</span>
                </button>
                <button
                    onClick={handleExplainDeeper}
                    disabled={isExplaining}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500/20 text-amber-200 rounded-full hover:bg-amber-500/40 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    <Icon name="info" className="w-5 h-5" />
                    <span>{showExplanation ? 'Hide Explanation' : 'Explain Deeper'}</span>
                </button>
            </div>

            {showExplanation && (
                <div className="mt-6 text-left p-4 bg-black/20 rounded-lg animate-fade-in max-w-3xl mx-auto">
                    {isExplaining ? (
                        <div className="flex items-center justify-center gap-3 text-amber-200 py-8">
                           <Icon name="lotus" className="w-6 h-6 animate-spin" />
                           <span>{t.guruThinking}</span>
                        </div>
                    ) : (
                        <p className="text-amber-100 whitespace-pre-wrap">{explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
};
