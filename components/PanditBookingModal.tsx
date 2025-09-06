
import React, { useState, useRef, useMemo } from 'react';
import { MajorEvent, Pandit, I18nContent } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

type Step = 'date' | 'time' | 'confirm';

export interface PanditBookingModalProps {
    event: MajorEvent;
    pandit: Pandit;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (details: { date: Date, timeSlot: string }) => Promise<void>;
}

export const PanditBookingModal = ({ event, pandit, t, onClose, onConfirm }: PanditBookingModalProps) => {
    const [step, setStep] = useState<Step>('date');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const isDateAvailable = (date: Date) => {
        if (!pandit.availability) return false;
        const dayOfWeek = date.getDay();
        const dateString = date.toISOString().split('T')[0];
        const isWorkingDay = pandit.availability.days.includes(dayOfWeek);
        const isOffDate = pandit.availability.offDates?.includes(dateString);
        return isWorkingDay && !isOffDate;
    };
    
    const timeSlots = useMemo(() => {
        if (!pandit.availability || pandit.availability.hours.length === 0) return [];
        
        // For this simpler event-based booking modal, we'll just use the first work period defined.
        // A more complex implementation could merge all available time slots from different periods.
        const { start, end } = pandit.availability.hours[0];
        const slots = [];
        let currentTime = new Date(`1970-01-01T${start}:00`);
        const endTime = new Date(`1970-01-01T${end}:00`);

        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().substring(0, 5);
            currentTime.setHours(currentTime.getHours() + 1);
            const slotEnd = currentTime.toTimeString().substring(0, 5);
            slots.push(`${slotStart} - ${slotEnd}`);
        }
        return slots;
    }, [pandit.availability]);

    const handleDateSelect = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (isDateAvailable(date)) {
            setSelectedDate(date);
            setStep('time');
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleSubmit = async () => {
        if (selectedDate && selectedTime) {
            setIsLoading(true);
            try {
                await onConfirm({ date: selectedDate, timeSlot: selectedTime });
            } finally {
                setIsLoading(false);
            }
        }
    };

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
            const isPast = date < today;
            const available = !isPast && isDateAvailable(date);
            
            return (
                <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    disabled={!available}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isPast ? 'text-stone-400' : ''
                    } ${
                        available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'text-stone-500'
                    } ${
                        new Date(year, month, day).getTime() === today.getTime() ? 'font-bold ring-2 ring-primary' : ''
                    }`}
                >
                    {day}
                </button>
            );
        });
        return {
            month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            days: [...blanks, ...dayElements],
        };
    }, [currentDate, pandit.availability]);
    
    const renderDateStep = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-secondary/20">&larr;</button>
                <h3 className="font-bold text-lg">{calendar.month}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-secondary/20">&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="font-bold text-xs text-text-muted">{d}</div>)}
                {calendar.days}
            </div>
             <p className="text-xs text-center mt-2 text-text-muted">Green indicates an available day.</p>
        </>
    );

    const renderTimeStep = () => (
        <div>
            <button onClick={() => setStep('date')} className="text-sm text-primary mb-2">&larr; Back to Calendar</button>
            <h3 className="font-bold text-lg mb-2">Select Time for <span className="text-secondary">{selectedDate?.toLocaleDateString()}</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                    <button key={slot} onClick={() => handleTimeSelect(slot)} className="p-2 border-2 border-secondary/30 rounded-lg hover:bg-secondary/20 focus:bg-secondary/30">
                        {slot}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderConfirmStep = () => (
        <div>
            <button onClick={() => setStep('time')} className="text-sm text-primary mb-2">&larr; Change Time</button>
            <h3 className="font-bold text-lg mb-4 text-center">Confirm Your Booking</h3>
            <div className="bg-primary/10 border border-secondary/30 p-4 rounded-lg space-y-2 text-text-base">
                <p><strong>Pandit:</strong> {pandit.name}</p>
                <p><strong>Event:</strong> {event.name}</p>
                <p><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p className="text-xl font-bold text-primary mt-2"><strong>Fee:</strong> ₹{pandit.cost}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pandit-booking-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold z-10"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="user-circle" className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 id="pandit-booking-title" className="text-3xl font-bold text-primary font-heading">{t.panditBookingTitle}</h2>
                    <p className="text-text-muted">for {pandit.name}</p>
                </div>

                {step === 'date' && renderDateStep()}
                {step === 'time' && renderTimeStep()}
                {step === 'confirm' && renderConfirmStep()}

                {step === 'confirm' && (
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="w-full mt-8 bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg transform hover:scale-105 disabled:bg-primary/50"
                    >
                        {isLoading ? 'Booking...' : t.confirmBooking}
                    </button>
                )}
            </div>
        </div>
    );
};