
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { I18nContent, Temple, DarshanTier, CrowdLevel, DarshanBookingDetails } from '../types';
import { Icon } from './Icon';
import { DARSHAN_TIERS, DARSHAN_TIME_SLOTS } from '../constants';
import * as api from '../services/apiService';
import { useFocusTrap } from '../hooks/useFocusTrap';

type Step = 'date' | 'time' | 'confirm';

export interface DarshanBookingModalProps {
    temple: Temple;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (details: DarshanBookingDetails) => Promise<void>;
}

const CrowdIndicatorDot = ({ level }: { level: CrowdLevel }) => {
    const colorClass = {
        'Low': 'bg-green-500',
        'Medium': 'bg-yellow-500',
        'High': 'bg-orange-500',
        'Very High': 'bg-red-600',
    }[level];
    return <div className={`w-2 h-2 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 ${colorClass}`}></div>;
};

const CrowdHeatmapBg = (level: CrowdLevel | undefined) => {
    if (!level) return '';
    const colorClass = {
        'Low': 'bg-green-500/10',
        'Medium': 'bg-yellow-500/10',
        'High': 'bg-orange-500/10',
        'Very High': 'bg-red-600/10',
    }[level];
    return colorClass;
}

export const DarshanBookingModal = ({ temple, onClose, onConfirm, t }: DarshanBookingModalProps) => {
    const [step, setStep] = useState<Step>('date');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<DarshanTier>(DARSHAN_TIERS[0]);
    const [availability, setAvailability] = useState<Map<string, CrowdLevel>>(new Map());
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    
    useEffect(() => {
        setIsAvailabilityLoading(true);
        api.getTempleAvailability(temple.id)
            .then(data => {
                setAvailability(data);
            })
            .finally(() => {
                setIsAvailabilityLoading(false);
            });
    }, [temple.id]);

    const handleDateSelect = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setStep('time');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleSubmit = async () => {
        if (selectedDate && selectedTime && selectedTier) {
            setIsLoading(true);
            try {
                await onConfirm({
                    date: selectedDate,
                    timeSlot: selectedTime,
                    tier: selectedTier
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const canGoToPrevMonth = useMemo(() => {
        const today = new Date();
        const canGoBack = currentDate.getFullYear() > today.getFullYear() || 
                          (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() > today.getMonth());
        return canGoBack;
    }, [currentDate]);
    
    const calendar = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0,0,0,0);

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`}></div>);

        const dayElements = days.map(day => {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isPast = date < today;
            const crowdLevel = availability.get(dateString);

            return (
                <div key={day} className={`relative flex items-center justify-center rounded-full ${CrowdHeatmapBg(crowdLevel)}`}>
                    <button
                        onClick={() => handleDateSelect(day)}
                        disabled={isPast}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isPast 
                                ? 'text-stone-400 cursor-not-allowed'
                                : 'text-stone-800 hover:bg-secondary/30 focus:bg-secondary/50'
                        } ${new Date(year, month, day).getTime() === today.getTime() ? 'font-bold ring-2 ring-primary' : ''}`}
                    >
                        {day}
                    </button>
                    {!isPast && crowdLevel && <CrowdIndicatorDot level={crowdLevel} />}
                </div>
            )
        });

        return {
            month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            days: [...blanks, ...dayElements],
        };
    }, [currentDate, availability]);

    const renderDateStep = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} disabled={!canGoToPrevMonth} className="p-2 rounded-full hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed">&larr;</button>
                <h3 className="font-bold text-lg">{calendar.month}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-secondary/20">&rarr;</button>
            </div>
            {isAvailabilityLoading ? (
                 <div className="flex justify-center items-center h-48"><Icon name="lotus" className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="font-bold text-xs text-text-muted">{d}</div>)}
                    {calendar.days}
                </div>
            )}
        </>
    );

    const renderTimeStep = () => (
        <div>
            <button onClick={() => setStep('date')} className="text-sm text-primary mb-2">&larr; Back to Calendar</button>
            <h3 className="font-bold text-lg mb-2">Select Time Slot for <span className="text-secondary">{selectedDate?.toLocaleDateString()}</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {DARSHAN_TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => handleTimeSelect(slot)} className="p-2 border-2 border-secondary/30 rounded-lg hover:bg-secondary/20 focus:bg-secondary/30">
                        {slot}
                    </button>
                ))}
            </div>
            <h3 className="font-bold text-lg mb-2 mt-4">{t.selectTier}</h3>
            <div className="space-y-2">
                {DARSHAN_TIERS.map((tier) => (
                    <div key={tier.name} onClick={() => setSelectedTier(tier)} className={`p-3 border-2 rounded-lg cursor-pointer ${selectedTier.name === tier.name ? 'border-primary bg-primary/10' : 'border-secondary/30'}`}>
                        <label className="flex items-center w-full cursor-pointer">
                            <input type="radio" name="darshan-tier" value={tier.name} checked={selectedTier.name === tier.name} onChange={() => setSelectedTier(tier)} className="h-4 w-4 text-primary focus:ring-primary" />
                            <div className="ml-3 flex-grow">
                                <span className="font-bold text-text-base">{tier.name}</span>
                            </div>
                            <span className="font-bold text-primary">₹{tier.cost}</span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderConfirmStep = () => (
        <div>
            <button onClick={() => setStep('time')} className="text-sm text-primary mb-2">&larr; Change Time/Tier</button>
            <h3 className="font-bold text-lg mb-4 text-center">Confirm Your Booking</h3>
            <div className="bg-primary/10 border border-secondary/30 p-4 rounded-lg space-y-2 text-text-base">
                <p><strong>Temple:</strong> {temple.name}</p>
                <p><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time Slot:</strong> {selectedTime}</p>
                <p><strong>Tier:</strong> {selectedTier.name}</p>
                <p className="text-xl font-bold text-primary mt-2"><strong>Total:</strong> ₹{selectedTier.cost}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="darshan-booking-title" className="bg-main rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold z-10">&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 id="darshan-booking-title" className="text-3xl font-bold text-primary font-heading">{t.darshanBookingTitle}</h2>
                    <p className="text-text-muted">{t.darshanBookingDesc} for <span className="font-semibold">{temple.name}</span>.</p>
                </div>

                <div className="text-sm text-text-muted bg-primary/10 p-2 rounded-lg mb-6 flex items-center justify-center gap-2 border border-secondary/30">
                    <Icon name="clock" className="w-4 h-4 text-primary" />
                    <span>Timings: {temple.darshanTimings}</span>
                </div>

                {step === 'date' && renderDateStep()}
                {step === 'time' && renderTimeStep()}
                {step === 'confirm' && renderConfirmStep()}

                {step === 'confirm' && (
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full mt-6 bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-all shadow-lg disabled:bg-secondary/50 transform hover:scale-105">
                         {isLoading ? 'Booking...' : `${t.confirmBooking} (₹${selectedTier.cost})`}
                    </button>
                )}
            </div>
        </div>
    );
};