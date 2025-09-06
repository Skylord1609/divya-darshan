import React, { useState } from 'react';
import { Temple } from '../types';
import * as aiService from '../services/aiService';
import { Icon } from './Icon';

interface SpiritualSignificanceProps {
    temple: Temple;
}

export const SpiritualSignificance = ({ temple }: SpiritualSignificanceProps) => {
    const [significance, setSignificance] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await aiService.generateSpiritualSignificance(temple);
            setSignificance(result);
        } catch (err) {
            setError("Could not retrieve significance at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 p-6 bg-amber-50/50 rounded-xl border-l-4 border-primary shadow-md">
            <h3 className="text-2xl font-bold font-heading mb-2">Spiritual Significance</h3>
            
            {isLoading ? (
                <div className="flex items-center gap-3 text-text-muted py-4">
                    <Icon name="lotus" className="w-6 h-6 animate-spin" />
                    <span>Divya Guru is contemplating...</span>
                </div>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : significance ? (
                <p className="text-text-base italic">{significance}</p>
            ) : (
                <>
                    <p className="text-text-muted mb-4">Discover why this sacred place is special to countless devotees.</p>
                    <button 
                        onClick={handleGenerate} 
                        className="bg-primary text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary transition-colors"
                    >
                        Reveal with AI Guru
                    </button>
                </>
            )}
        </div>
    );
};
