import React, { useState, useEffect } from 'react';
import { I18nContent, ChatRoom as ChatRoomType } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';
import { CardAnimator } from './CardAnimator';

const SatsangCard = ({ room, t }: { room: ChatRoomType; t: I18nContent; }) => {
    const navigateTo = (path: string) => { window.location.hash = path; };
    const roomName = t[room.name];
    const roomDesc = t[room.description];
    
    return (
        <CardAnimator>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-4 border-primary hover:shadow-xl hover:border-secondary transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <Icon name={room.icon} className="w-8 h-8"/>
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-text-base">{roomName}</h2>
                </div>
                <p className="text-text-muted flex-grow mb-4">{roomDesc}</p>
                <button 
                    onClick={() => navigateTo(`/satsang/${room.id}`)}
                    className="mt-auto bg-primary text-white font-bold py-2 px-6 rounded-full self-start hover:bg-secondary transition-colors"
                >
                    {t.satsangJoinCircle}
                </button>
            </div>
        </CardAnimator>
    );
};

export const SatsangView = ({ t }: { t: I18nContent }) => {
    const [rooms, setRooms] = useState<ChatRoomType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        api.getChatRooms()
            .then(setRooms)
            .catch(() => addToast("Could not load community circles.", 'error'))
            .finally(() => setIsLoading(false));
    }, [addToast]);
    
    return (
        <div className="min-h-full p-4 sm:p-8 animate-fade-in">
            <header className="text-center mb-12">
                <Icon name="users-group" className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-text-base">{t.satsangTitle}</h1>
                <p className="mt-2 text-lg max-w-3xl mx-auto text-text-muted">{t.satsangDesc}</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/80 p-6 rounded-xl shadow-lg animate-pulse">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                                <div className="h-8 bg-stone-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                            <div className="h-10 bg-stone-300 rounded-full w-32 mt-4"></div>
                        </div>
                    ))
                ) : rooms.map(room => (
                    <SatsangCard key={room.id} room={room} t={t} />
                ))}
            </main>

            <aside className="mt-16 max-w-2xl mx-auto bg-amber-50 p-6 rounded-lg border border-secondary">
                 <h3 className="font-bold text-xl text-amber-800 text-center mb-2">{t.satsangCommunityGuidelines}</h3>
                 <p className="text-sm text-amber-900/80 text-center">{t.satsangGuidelinesContent}</p>
            </aside>
        </div>
    );
};