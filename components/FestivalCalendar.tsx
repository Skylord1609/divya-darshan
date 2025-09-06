import React, { useState, useEffect, useMemo } from 'react';
import { Festival, I18nContent, Language } from '../types';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/apiService';
import { Icon } from './Icon';

interface FestivalCalendarProps {
    t: I18nContent;
}

const Countdown = ({ toDate }: { toDate: Date }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(toDate) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    return (
        <div className="flex justify-center gap-2 text-xs font-mono">
            <div><span className="font-bold text-base">{timeLeft.days}</span>d</div>
            <div><span className="font-bold text-base">{timeLeft.hours}</span>h</div>
            <div><span className="font-bold text-base">{timeLeft.minutes}</span>m</div>
            <div><span className="font-bold text-base">{timeLeft.seconds}</span>s</div>
        </div>
    );
};

const FestivalCard = ({ festival, isNext, onSubscribe }: { festival: Festival; isNext: boolean; onSubscribe: () => void; }) => (
    <div className={`p-6 rounded-lg shadow-md transition-all duration-300 ${isNext ? 'bg-white border-2 border-primary animate-glow-border' : 'bg-white/80 border-l-4 border-secondary'}`}>
        <p className={`font-bold text-sm ${isNext ? 'text-primary' : 'text-text-muted'}`}>{festival.date}</p>
        <h3 className={`text-xl font-bold mt-1 mb-2 ${isNext ? 'text-primary' : 'text-text-base'}`}>{festival.name}</h3>
        <p className="text-text-base text-sm mb-4">{festival.description}</p>
        {isNext && festival.nextOccurrence && (
             <div className="my-3 p-2 bg-primary/10 rounded">
                <Countdown toDate={festival.nextOccurrence} />
            </div>
        )}
        <button onClick={onSubscribe} className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-1">
            <Icon name="bell" className="w-4 h-4"/>
            Subscribe to Updates
        </button>
    </div>
);

const Skeleton = () => (
    <div className="bg-white/80 p-6 rounded-lg shadow-md border-l-4 border-secondary/30">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-2/3 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse mt-1"></div>
    </div>
);

export const FestivalCalendar = ({ t }: FestivalCalendarProps) => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterRange, setFilterRange] = useState<'month' | 'quarter' | 'all'>('all');
    const { addToast } = useToast();

    const doFetch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getFestivals(Language.EN);
            const now = new Date();
            const year = now.getFullYear();
            const processedData = data.map(f => {
                let nextOccurrence: Date | undefined;
                try {
                    const dateStr = f.date.split('(')[0]?.trim() || f.date;
                    const parsed = new Date(`${dateStr} ${year}`);
                    if (!isNaN(parsed.getTime())) {
                        if (parsed < now) {
                           parsed.setFullYear(year + 1);
                        }
                        nextOccurrence = parsed;
                    }
                } catch(e) {/* ignore */}
                return { ...f, nextOccurrence };
            }).sort((a,b) => (a.nextOccurrence?.getTime() || Infinity) - (b.nextOccurrence?.getTime() || Infinity));

            setFestivals(processedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t.festivalsError;
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        doFetch();
        
        const handleDataUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.key === 'festivals') {
                doFetch();
            }
        };
        window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        return () => {
            window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        };
    }, []);
    
    const filteredFestivals = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (filterRange === 'all') {
            return festivals.filter(f => f.nextOccurrence && f.nextOccurrence >= now);
        }
        if (filterRange === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return festivals.filter(f => f.nextOccurrence && f.nextOccurrence >= startOfMonth && f.nextOccurrence <= endOfMonth);
        }
        if (filterRange === 'quarter') {
            const endOfQuarter = new Date(now);
            endOfQuarter.setDate(now.getDate() + 90);
            endOfQuarter.setHours(23, 59, 59, 999);
            return festivals.filter(f => f.nextOccurrence && f.nextOccurrence >= now && f.nextOccurrence <= endOfQuarter);
        }
        return festivals;
    }, [festivals, filterRange]);

    const nextFestivalId = useMemo(() => {
        const upcoming = festivals.filter(f => f.nextOccurrence && f.nextOccurrence >= new Date());
        return upcoming.length > 0 ? upcoming[0].id : null;
    }, [festivals]);

    const handleRetry = () => { doFetch(); }
    const handleSubscribe = () => { addToast("Subscribed to festival reminders!", 'success'); };

    const FilterButton = ({ range, label }: { range: typeof filterRange, label: string }) => (
        <button
            onClick={() => setFilterRange(range)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                filterRange === range
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/60 text-primary hover:bg-white'
            }`}
        >
            {label}
        </button>
    );

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
             <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
                <p>{error}</p>
                <button onClick={handleRetry} className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors">
                    Retry
                </button>
            </div>
        );
    }
    
    return (
        <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <FilterButton range="month" label="This Month" />
                <FilterButton range="quarter" label="Next 3 Months" />
                <FilterButton range="all" label="All Upcoming" />
            </div>
            {filteredFestivals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFestivals.map((festival) => (
                        <FestivalCard key={festival.id} festival={festival} isNext={festival.id === nextFestivalId} onSubscribe={handleSubscribe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-text-muted">
                    <p>No festivals found for the selected date range.</p>
                </div>
            )}
        </>
    );
};
