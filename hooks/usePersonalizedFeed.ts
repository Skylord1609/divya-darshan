import { useState, useEffect } from 'react';
import { FeedItem, Language } from '../types';
import * as api from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const usePersonalizedFeed = (language: Language) => {
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        let isCancelled = false;
        
        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const feedData = currentUser
                    ? await api.getPersonalizedFeed(currentUser, language)
                    : await api.getDiscoverFeed(language);
                
                if (!isCancelled) {
                    setFeed(feedData);
                }
            } catch (error) {
                if (!isCancelled) {
                    addToast("Could not load recommendations.", 'error');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchFeed();
        
        return () => {
            isCancelled = true;
        };
    }, [currentUser, addToast, language]);
    
    return { feed, isLoading };
};
