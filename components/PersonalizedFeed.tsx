import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePersonalizedFeed } from '../hooks/usePersonalizedFeed';
import { I18nContent, Language } from '../types';
import { RecommendationCard } from './RecommendationCard';
import { Section } from './Section';
import { Icon } from './Icon';
import { useModal } from '../contexts/ModalContext';

interface PersonalizedFeedProps {
    t: I18nContent;
    language: Language;
}

const RecommendationCardSkeleton = () => (
    <div className="w-64 flex-shrink-0 animate-pulse">
        <div className="bg-gray-300 h-32 rounded-t-lg"></div>
        <div className="bg-white p-3 rounded-b-lg">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
        </div>
    </div>
);


export const PersonalizedFeed = ({ t, language }: PersonalizedFeedProps) => {
    const { currentUser } = useAuth();
    const { feed, isLoading } = usePersonalizedFeed(language);
    const { openModal } = useModal();

    const title = currentUser 
        ? t.feedForYou.replace('{name}', currentUser.name.split(' ')[0]) 
        : t.feedDiscover;

    if (isLoading) {
        return (
            <Section id="personalized-feed" title={title} icon={<Icon name="star" className="w-8 h-8" />}>
                 <div className="flex overflow-x-auto space-x-6 carousel-container pb-4 -mx-4 px-4">
                    {[...Array(5)].map((_, i) => <RecommendationCardSkeleton key={i} />)}
                </div>
            </Section>
        );
    }
    
    if (!feed || feed.length === 0) {
        return null; // Don't show the section if there's nothing to recommend
    }
    
    return (
        <Section id="personalized-feed" title={title} icon={<Icon name="star" className="w-8 h-8" />}>
            <div className="flex overflow-x-auto space-x-6 carousel-container pb-4 -mx-4 px-4">
                {feed.map((item, index) => (
                    <RecommendationCard 
                        key={`${item.type}-${item.item.id}-${index}`}
                        feedItem={item}
                        t={t}
                        onViewImage={() => openModal('imageDetail', { imageUrl: item.item.imageUrl, altText: item.item.name })}
                    />
                ))}
            </div>
        </Section>
    );
};
