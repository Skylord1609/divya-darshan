

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { I18nContent, Pooja, Language } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CardAnimator } from './CardAnimator';
import { PoojaCard } from './PoojaCard';
import { PoojaCardSkeleton } from './PoojaCardSkeleton';
import { Icon } from './Icon';

export interface OnlinePoojasProps {
  t: I18nContent;
  language: Language;
}

export const OnlinePoojas = ({ t, language }: OnlinePoojasProps) => {
  const [onlinePoojas, setOnlinePoojas] = useState<Pooja[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allPoojas = await api.getPoojas(language);
      setOnlinePoojas(allPoojas.filter(p => p.isOnline));
    } catch (error) {
      addToast(`Failed to load online poojas`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handlePoojaBooking = (pooja: Pooja) => {
    if (!currentUser) {
        openModal('login');
    } else {
        openModal('poojaBooking', { pooja });
    }
  };
  
  // FIX: Add handler for asking Guru about a specific pooja.
  const handleAskGuru = (pooja: Pooja) => {
    openModal('aiGuruChat', { pooja });
  };

  return (
    <div className="animate-fade-in py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
            <Icon name="camera" className="w-12 h-12 text-primary" />
            <div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading">Online Poojas</h1>
                <p className="text-lg text-text-muted">Participate in sacred rituals from anywhere in the world.</p>
            </div>
        </div>
        
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <PoojaCardSkeleton key={i} />)}
            </div>
        ) : onlinePoojas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {onlinePoojas.map(pooja => (
                    <CardAnimator key={pooja.id}>
                        <PoojaCard 
                            pooja={pooja} 
                            t={t} 
                            onBook={handlePoojaBooking}
                            onViewImage={() => openModal('imageDetail', {imageUrl: pooja.imageUrl, altText: pooja.name})}
                            onAskGuru={handleAskGuru}
                        />
                    </CardAnimator>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 text-stone-600">
                <h3 className="text-2xl font-semibold mb-2">No Online Poojas Available</h3>
                <p>Please check back later for online service offerings.</p>
            </div>
        )}
      </div>
    </div>
  );
};
