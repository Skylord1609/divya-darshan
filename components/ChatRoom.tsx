
import React, { useState, useEffect, useRef } from 'react';
import { I18nContent, ChatMessage, ChatRoom as ChatRoomType, User } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Icon } from './Icon';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

interface ChatRoomProps {
    roomId: number;
    t: I18nContent;
}

export const ChatRoom = ({ roomId, t }: ChatRoomProps) => {
    const [room, setRoom] = useState<ChatRoomType | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [users, setUsers] = useState<Map<number, User>>(new Map());
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { openModal } = useModal();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isCancelled = false;
        
        const fetchUpdates = async () => {
            if (document.hidden) return; // Don't poll if tab is not visible
            try {
                const [msgs, online] = await Promise.all([
                    api.getChatMessages(roomId),
                    api.getOnlineUsers(roomId)
                ]);
                if (!isCancelled) {
                    setMessages(msgs);
                    setOnlineUsers(online);
                }
            } catch {
                console.error("Failed to poll for chat updates.");
            }
        };

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [rooms, initialMsgs, userList, initialOnline] = await Promise.all([
                    api.getChatRooms(),
                    api.getChatMessages(roomId),
                    api.getUsersList(),
                    api.getOnlineUsers(roomId)
                ]);
                
                if (isCancelled) return;

                const currentRoom = rooms.find(r => r.id === roomId);
                if (currentRoom) setRoom(currentRoom);
                else addToast("Chat room not found.", 'error');

                setMessages(initialMsgs);
                setUsers(new Map(userList.map(u => [u.id, u])));
                setOnlineUsers(initialOnline);
            } catch {
                 if (!isCancelled) addToast("Could not load chat room details.", 'error');
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchInitialData();
        const intervalId = setInterval(fetchUpdates, 3000);

        return () => {
            isCancelled = true;
            clearInterval(intervalId);
        };
    }, [roomId, addToast]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            const isScrolledNearBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 200;
            if (isScrolledNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || isSending) return;

        const text = newMessage.trim();
        const optimisticMessage: ChatMessage = {
            id: Date.now(),
            roomId,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            text,
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setIsSending(true);

        try {
            await api.postChatMessage(roomId, text, currentUser);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to send message.", 'error');
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };
    
    const onBack = () => { window.location.hash = '#/satsang'; };
    
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Icon name="lotus" className="w-12 h-12 text-primary animate-spin" /></div>;
    }
    
    if (!room) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl text-red-600">This chat room does not exist.</p>
                <button onClick={onBack} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-secondary transition-colors">
                    Back to Satsang Hub
                </button>
            </div>
        );
    }
    
    const roomName = t[room.name];

    return (
        <div className="h-full flex flex-col p-4 bg-main">
            <header className="flex-shrink-0 flex items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full"><Icon name="chevron-left" className="w-6 h-6 text-primary" /></button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-text-base">{roomName}</h1>
                        <p className="text-sm text-text-muted">{t[room.description]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <div className="flex -space-x-2">
                        {onlineUsers.slice(0, 3).map(u => (
                            <img key={u.id} src={u.avatarUrl || PLACEHOLDER_IMAGE_URL} alt={u.name} className="w-7 h-7 rounded-full border-2 border-main" />
                        ))}
                    </div>
                    <span>{onlineUsers.length} online</span>
                </div>
            </header>

            <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 -mr-2">
                {messages.map(msg => {
                    const messageUser = users.get(msg.userId);
                    return (
                        <div key={msg.id} className={`flex items-start gap-2 my-3 ${msg.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            {msg.userId !== currentUser?.id && (
                                <button onClick={() => messageUser && openModal('userProfile', { user: messageUser })} className="flex-shrink-0 focus:outline-none focus:ring-2 ring-primary rounded-full">
                                    <img src={messageUser?.avatarUrl || PLACEHOLDER_IMAGE_URL} alt={msg.userName} className="w-10 h-10 rounded-full object-cover" />
                                </button>
                            )}
                            <div className={`max-w-md ${msg.userId === currentUser?.id ? 'order-1' : 'order-2'}`}>
                                <div className={`px-4 py-2 rounded-2xl ${msg.userId === currentUser?.id ? 'bg-primary text-white rounded-br-none' : 'bg-stone-200 text-text-base rounded-bl-none'}`}>
                                    {msg.userId !== currentUser?.id && (
                                        <button onClick={() => messageUser && openModal('userProfile', { user: messageUser })} className="text-xs font-bold text-primary mb-1 hover:underline">
                                            {msg.userName}
                                        </button>
                                    )}
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <p className={`text-xs text-stone-400 mt-1 px-1 ${msg.userId === currentUser?.id ? 'text-right' : 'text-left'}`}>
                                    {formatTimestamp(msg.timestamp)}
                                </p>
                            </div>
                             {msg.userId === currentUser?.id && (
                                <div className="flex-shrink-0 order-2">
                                     <img src={currentUser?.avatarUrl || PLACEHOLDER_IMAGE_URL} alt={currentUser?.name} className="w-10 h-10 rounded-full object-cover" />
                                </div>
                            )}
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex-shrink-0 flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.satsangTypeMessage}
                    className="w-full p-3 rounded-full border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-primary text-white font-bold p-3 rounded-full transition-colors duration-300 shadow-md hover:bg-secondary disabled:bg-stone-400 disabled:cursor-not-allowed"
                >
                    <Icon name="play" className="w-6 h-6 transform rotate-90" />
                </button>
            </form>
        </div>
    );
};
