import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { I18nContent, Pooja, Temple, PoojaBookingDetails, Language, Pandit, Booking } from '../types';
import { Icon } from './Icon';
import { DARSHAN_TIME_SLOTS } from '../constants';
import * as api from '../services/apiService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useToast } from '../contexts/ToastContext';
import { isPanditAvailable, parseDurationToMinutes, AvailabilityStatus } from '../utils/bookingUtils';

type Step = 'serviceType' | 'location' | 'date' | 'time' | 'pandit' | 'address' | 'confirm';

export interface PoojaBookingModalProps {
    pooja: Pooja;
    temple?: Temple;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (details: PoojaBookingDetails) => Promise<void>;
}

export const PoojaBookingModal = ({ pooja, temple, onClose, onConfirm, t }: PoojaBookingModalProps) => {
    
    const getInitialState = useCallback(() => {
        if (pooja.isOnline && pooja.serviceType === 'General') {
             // If pooja can be online and is not temple-specific, always ask first.
            return { step: 'serviceType' as Step, type: null };
        }
         // If it's offline-only or booked from a temple context
        return { step: temple ? 'date' as Step : 'location' as Step, type: 'Offline' as 'Offline' | 'Online' };
    }, [pooja, temple]);


    const [step, setStep] = useState<Step>(() => getInitialState().step);
    const [serviceType, setServiceType] = useState<'Online' | 'Offline' | null>(() => getInitialState().type);
    
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [allPandits, setAllPandits] = useState<Pandit[]>([]);
    const [panditAvailability, setPanditAvailability] = useState<{ pandit: Pandit; status: AvailabilityStatus }[]>([]);
    const [selectedPandit, setSelectedPandit] = useState<Pandit | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isPanditLoading, setIsPanditLoading] = useState(false);

    const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
    const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
    
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        api.getPandits(Language.EN).then(setAllPandits);
    }, []);
    
    const totalCost = useMemo(() => pooja.cost + (selectedPandit?.cost || 0), [pooja, selectedPandit]);

    const findAvailablePandits = useCallback(async () => {
        if (!selectedDate || !selectedTime || !serviceType || (serviceType === 'Offline' && !city && !temple)) return;

        setIsPanditLoading(true);
        setSpecialtyFilter(''); // Reset filter on new search

        try {
            const allBookings = await api.getBookings();
            
            const poojaDuration = parseDurationToMinutes(pooja.duration);
            const [startHour, startMinute] = selectedTime.split(' - ')[0].split(':').map(Number);
            const requestedDateTime = new Date(selectedDate);
            requestedDateTime.setHours(startHour, startMinute, 0, 0);

            const panditsToShow = allPandits.filter(p => {
                const serviceMatch = p.services.includes(serviceType);
                const specialtyMatch = p.specialties.includes(pooja.name);
                const locationMatch = serviceType === 'Online' || (temple ? true : p.location.toLowerCase().includes(city.toLowerCase()));
                return serviceMatch && specialtyMatch && locationMatch;
            });
            
            const specialties = [...new Set(panditsToShow.flatMap(p => p.specialties))];
            setAvailableSpecialties(specialties);

            const availabilityResults = panditsToShow.map(p => ({
                pandit: p,
                status: isPanditAvailable(p, poojaDuration, requestedDateTime, allBookings)
            }));

            availabilityResults.sort((a, b) => {
                if (a.status.available && !b.status.available) return -1;
                if (!a.status.available && b.status.available) return 1;
                return a.pandit.name.localeCompare(b.pandit.name);
            });
            
            setPanditAvailability(availabilityResults);
        } catch (err) {
            addToast("Could not check pandit availability.", "error");
        } finally {
            setIsPanditLoading(false);
        }
    }, [selectedDate, selectedTime, serviceType, city, temple, allPandits, pooja.duration, pooja.name, addToast]);
    
    const filteredPandits = useMemo(() => {
        if (!specialtyFilter) {
            return panditAvailability;
        }
        return panditAvailability.filter(({ pandit }) =>
            pandit.specialties.includes(specialtyFilter)
        );
    }, [panditAvailability, specialtyFilter]);
    
    const handleServiceTypeSelect = (type: 'Online' | 'Offline') => {
        setServiceType(type);
        setStep(type === 'Online' ? 'date' : 'location');
    };

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) setStep('date');
        else addToast("Please enter your city.", "info");
    };
    
    const handleDateSelect = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setStep('time');
    };
    
    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('pandit');
    };

    useEffect(() => {
        if (step === 'pandit') {
            findAvailablePandits();
        }
    }, [step, findAvailablePandits]);
    
    const handlePanditSelect = (pandit: Pandit) => {
        setSelectedPandit(pandit);
        setStep(serviceType === 'Offline' && !temple ? 'address' : 'confirm');
    };
    
    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (address.trim()) setStep('confirm');
        else addToast("Please enter your full address.", "info");
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedPandit || !serviceType) {
            addToast("Please complete all steps.", 'error');
            return;
        }
        if (serviceType === 'Offline' && !temple && !address) {
             addToast("Please provide an address for the service.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            // --- FINAL VALIDATION (RACE CONDITION FIX) ---
            const allBookings = await api.getBookings();
            const poojaDuration = parseDurationToMinutes(pooja.duration);
            const [startHour, startMinute] = selectedTime.split(' - ')[0].split(':').map(Number);
            const requestedDateTime = new Date(selectedDate);
            requestedDateTime.setHours(startHour, startMinute, 0, 0);

            const finalCheck = isPanditAvailable(selectedPandit, poojaDuration, requestedDateTime, allBookings);

            if (!finalCheck.available) {
                addToast(`Sorry, Pandit ${selectedPandit.name} is no longer available for this slot. Please select another.`, 'error');
                setStep('pandit'); // Go back to pandit selection
                setIsLoading(false);
                return;
            }
            // --- END VALIDATION ---
            
            await onConfirm({
                pooja,
                temple: temple || undefined,
                date: selectedDate,
                timeSlot: selectedTime,
                pandit: selectedPandit,
                serviceType,
                address: temple ? undefined : address,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const calendar = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            days: [
                ...Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`}></div>),
                ...Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const isPast = date < today;
                    return (
                        <button key={day} onClick={() => handleDateSelect(day)} disabled={isPast} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPast ? 'text-stone-400 cursor-not-allowed' : 'text-stone-800 hover:bg-orange-200 focus:bg-orange-300'} ${date.getTime() === today.getTime() ? 'font-bold ring-2 ring-orange-400' : ''}`}>
                            {day}
                        </button>
                    );
                })
            ]
        };
    }, [currentDate]);

    const renderStep = () => {
        switch(step) {
            case 'serviceType': return (
                <div>
                    <h3 className="font-bold text-lg mb-4 text-center">How would you like to perform this Pooja?</h3>
                    <div className="flex gap-4">
                        <button onClick={() => handleServiceTypeSelect('Offline')} className="flex-1 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-200 flex flex-col items-center">
                            <Icon name="users" className="w-8 h-8 text-primary mb-2" />
                            <span className="font-semibold">{temple ? `At ${temple.name}` : `At My Location`}</span>
                        </button>
                        <button onClick={() => handleServiceTypeSelect('Online')} className="flex-1 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-200 flex flex-col items-center">
                            <Icon name="camera" className="w-8 h-8 text-primary mb-2" />
                            <span className="font-semibold">Online (Video Call)</span>
                        </button>
                    </div>
                </div>
            );
            case 'location': return (
                <form onSubmit={handleLocationSubmit}>
                    <button onClick={() => setStep('serviceType')} className="text-sm text-orange-600 mb-2">&larr; Back</button>
                    <label htmlFor="city-input" className="block font-bold text-lg mb-2 text-center">Where will the Pooja be performed?</label>
                    <input id="city-input" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter your City" className="w-full p-3 rounded-lg border-2 border-orange-200" required />
                    <button type="submit" className="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-full hover:bg-orange-700">Continue</button>
                </form>
            );
            case 'date': return (
                <>
                    <button onClick={() => setStep(pooja.isOnline && !temple ? 'serviceType' : 'location')} className="text-sm text-orange-600 mb-2">&larr; Back</button>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-orange-200">&larr;</button>
                        <h3 className="font-bold text-lg">{calendar.month}</h3>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-orange-200">&rarr;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="font-bold text-xs text-stone-500">{d}</div>)}
                        {calendar.days}
                    </div>
                </>
            );
            case 'time': return (
                <div>
                    <button onClick={() => setStep('date')} className="text-sm text-orange-600 mb-2">&larr; Back to Calendar</button>
                    <h3 className="font-bold text-lg mb-2">Select Time Slot for <span className="text-orange-700">{selectedDate?.toLocaleDateString()}</span></h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {DARSHAN_TIME_SLOTS.map(slot => <button key={slot} onClick={() => handleTimeSelect(slot)} className="p-2 border-2 border-orange-200 rounded-lg hover:bg-orange-200">{slot}</button>)}
                    </div>
                </div>
            );
            case 'pandit': return (
                <div>
                    <button onClick={() => setStep('time')} className="text-sm text-orange-600 mb-2">&larr; Change Time</button>
                    <h3 className="font-bold text-lg mb-2">Select an Available Pandit</h3>

                    {availableSpecialties.length > 1 && (
                        <div className="mb-4">
                            <label htmlFor="specialty-filter" className="block text-sm font-bold text-orange-800 mb-1">Filter by Specialty</label>
                            <select
                                id="specialty-filter"
                                value={specialtyFilter}
                                onChange={e => setSpecialtyFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border-2 border-orange-200 bg-white"
                            >
                                <option value="">All Specialties</option>
                                {availableSpecialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isPanditLoading ? <div className="flex justify-center items-center h-48"><Icon name="lotus" className="w-8 h-8 animate-spin text-orange-500" /></div>
                        : filteredPandits.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {filteredPandits.map(({ pandit, status }) => (
                                    <button
                                        key={pandit.id}
                                        onClick={() => status.available && handlePanditSelect(pandit)}
                                        disabled={!status.available}
                                        className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                                            status.available 
                                            ? 'border-orange-200 hover:bg-orange-200 cursor-pointer'
                                            : 'border-stone-200 bg-stone-100 cursor-not-allowed opacity-70'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{pandit.name}</p>
                                                <p className="text-xs text-stone-500">{pandit.specialties.join(', ')}</p>
                                            </div>
                                            <p className="font-bold text-orange-700">₹{pandit.cost}</p>
                                        </div>
                                        {!status.available && (
                                            <p className="text-xs text-red-600 mt-1 font-semibold">
                                                {status.reason === 'BOOKING_CONFLICT' && 'Already booked at this time'}
                                                {status.reason === 'OUTSIDE_HOURS' && 'Outside of working hours'}
                                                {status.reason === 'OFF_DAY' && 'Not working on this day'}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : <p className="text-center text-stone-600 p-4 bg-amber-100 rounded-lg">No pandits found matching your criteria. Please try another time or specialty.</p>}
                </div>
            );
            case 'address': return (
                 <form onSubmit={handleAddressSubmit}>
                    <button onClick={() => setStep('pandit')} className="text-sm text-orange-600 mb-2">&larr; Change Pandit</button>
                    <label htmlFor="address-input" className="block font-bold text-lg mb-2 text-center">Enter your Full Address</label>
                    <p className="text-center text-sm text-stone-600 mb-3">Your selected pandit will bring the required Samagri (pooja items) to this location.</p>
                    <textarea id="address-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full Address, including Pincode" className="w-full p-3 h-24 rounded-lg border-2 border-orange-200" required />
                    <button type="submit" className="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-full hover:bg-orange-700">Confirm Address</button>
                </form>
            );
            case 'confirm': return (
                <div>
                    <button onClick={() => setStep(serviceType === 'Offline' && !temple ? 'address' : 'pandit')} className="text-sm text-orange-600 mb-2">&larr; Back</button>
                    <h3 className="font-bold text-lg mb-4 text-center">Confirm Your Booking</h3>
                    <div className="bg-amber-100 border border-amber-200 p-4 rounded-lg space-y-2 text-stone-700">
                        <p><strong>Pooja:</strong> {pooja.name}</p>
                        <p><strong>Location:</strong> {serviceType === 'Online' ? 'Online' : temple?.name || address}</p>
                        <p><strong>Pandit:</strong> {selectedPandit?.name}</p>
                        <p><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-GB')}</p>
                        <p><strong>Time:</strong> {selectedTime}</p>
                        <p className="text-xl font-bold text-orange-800 mt-2"><strong>Total:</strong> ₹{totalCost.toLocaleString()}</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="pooja-booking-title" className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold z-10">&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="pooja-booking-title" className="text-3xl font-bold text-orange-900 font-serif">{t.poojaBookingTitle}</h2>
                    <p className="text-stone-600">{pooja.name}</p>
                </div>
                {renderStep()}
                {step === 'confirm' && (
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full mt-6 bg-orange-600 text-white font-bold py-3 rounded-full hover:bg-orange-700 disabled:bg-orange-400">
                         {isLoading ? 'Booking...' : `${t.confirmBooking} (₹${totalCost.toLocaleString()})`}
                    </button>
                )}
            </div>
        </div>
    );
};
