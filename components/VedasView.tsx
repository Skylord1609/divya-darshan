import React, { useState } from 'react';
import { I18nContent, IconName } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';
import { CardAnimator } from './CardAnimator';

interface VedasViewProps {
  t: I18nContent;
}

const vedaDetails = {
    rigveda: {
        titleKey: 'rigvedaTitle',
        subtitleKey: 'rigvedaSubtitle',
        descKey: 'rigvedaDesc',
        kidDescKey: 'rigvedaKidDesc',
        topicsKey: 'rigvedaTopics',
        icon: 'flame' as IconName,
        color: '#fb8500',
        contentKey: 'rigveda'
    },
    samaveda: {
        titleKey: 'samavedaTitle',
        subtitleKey: 'samavedaSubtitle',
        descKey: 'samavedaDesc',
        kidDescKey: 'samavedaKidDesc',
        topicsKey: 'samavedaTopics',
        icon: 'om' as IconName,
        color: '#023047',
        contentKey: 'samaveda'
    },
    yajurveda: {
        titleKey: 'yajurvedaTitle',
        subtitleKey: 'yajurvedaSubtitle',
        descKey: 'yajurvedaDesc',
        kidDescKey: 'yajurvedaKidDesc',
        topicsKey: 'yajurvedaTopics',
        icon: 'diya' as IconName,
        color: '#219ebc',
        contentKey: 'yajurveda'
    },
    atharvaveda: {
        titleKey: 'atharvavedaTitle',
        subtitleKey: 'atharvavedaSubtitle',
        descKey: 'atharvavedaDesc',
        kidDescKey: 'atharvavedaKidDesc',
        topicsKey: 'atharvavedaTopics',
        icon: 'lotus' as IconName,
        color: '#8ecae6',
        contentKey: 'atharvaveda'
    }
};

export const VedasView = ({ t }: VedasViewProps) => {
    const [isKidFriendly, setIsKidFriendly] = useState(false);
    const { addToast } = useToast();
    const navigateTo = (path: string) => { window.location.hash = path; };

    return (
        <div className="min-h-full vedas-view-container p-4 sm:p-8 animate-fade-in">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isKidFriendly ? 'font-kid-friendly text-lg' : ''}`}>{t.kidFriendlyMode}</span>
                    <label className="toggle-switch-vedas">
                        <input type="checkbox" checked={isKidFriendly} onChange={() => setIsKidFriendly(!isKidFriendly)} />
                        <span className="slider-vedas"></span>
                    </label>
                </div>
            </div>

            <header className="text-center my-8">
                <h1 className="text-5xl md:text-7xl font-bold vedas-main-title text-amber-800">{t.vedasTitle}</h1>
                <p className="font-noto-serif text-3xl md:text-5xl mt-2 vedas-main-title text-amber-900">वेद</p>
                <p className="mt-4 text-lg max-w-3xl mx-auto">{t.vedasSubtitle}</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {Object.values(vedaDetails).map(veda => (
                    <CardAnimator key={veda.titleKey}>
                        <div className="veda-card rounded-2xl p-6 flex flex-col h-full">
                            <div className="text-center mb-4">
                                <div className="veda-card-icon inline-block p-4 bg-white/50 rounded-full" style={{ color: veda.color }}>
                                    <Icon name={veda.icon} className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-heading font-bold mt-3" style={{ color: veda.color }}>{t[veda.titleKey as keyof I18nContent]}</h2>
                                <p className="text-lg font-semibold">{t[veda.subtitleKey as keyof I18nContent]}</p>
                            </div>
                            <div className={`p-4 rounded-lg min-h-[160px] ${isKidFriendly ? 'font-kid-friendly text-xl' : 'text-base'}`}>
                                <p>
                                    {isKidFriendly ? t[veda.kidDescKey as keyof I18nContent] : t[veda.descKey as keyof I18nContent]}
                                </p>
                            </div>
                            <div className="mt-auto pt-4">
                                <h4 className="font-bold text-lg mb-2">{t.keyTopics}</h4>
                                <p className="text-sm italic">{t[veda.topicsKey as keyof I18nContent]}</p>
                                <div className="flex justify-center items-center mt-6 gap-4">
                                    <button onClick={() => navigateTo(`/bookReader/${veda.contentKey}`)} className="veda-card-button px-4 py-2 rounded-lg font-semibold flex-1 text-center">{t.readNow}</button>
                                    <button onClick={() => addToast("Interactive content coming soon!", "info")} className="veda-card-button px-4 py-2 rounded-lg font-semibold flex-1 text-center">{t.explore}</button>
                                </div>
                            </div>
                        </div>
                    </CardAnimator>
                ))}
            </main>

            <footer className="mt-12 text-center">
                 <div className="max-w-md mx-auto bg-white/50 p-4 rounded-xl border border-amber-600/50">
                    <h3 className="text-xl font-bold font-heading">{t.spiritualTriviaTitle}</h3>
                    <p className="mt-2 text-sm italic">{t.spiritualTriviaContent}</p>
                 </div>
            </footer>
        </div>
    );
};
