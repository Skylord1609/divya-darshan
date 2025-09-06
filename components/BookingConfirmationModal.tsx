import React, { useRef, useMemo } from 'react';
import { I18nContent, Temple, DarshanBookingDetails, PoojaBookingDetails, YatraBookingDetails, Sloka, CustomYatraBookingDetails } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useToast } from '../contexts/ToastContext';
import { SLOKA_DATA } from '../constants';

type BookingDetails = DarshanBookingDetails | PoojaBookingDetails | YatraBookingDetails | CustomYatraBookingDetails;

interface BookingConfirmationModalProps {
    type: 'Darshan' | 'Pooja' | 'Yatra' | 'Custom Yatra';
    itemName: string;
    details: BookingDetails;
    temple?: Temple;
    t: I18nContent;
    onClose: () => void;
}

const QR_CODE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DivyaDarshanBookingConfirmed';

export const BookingConfirmationModal = ({ type, itemName, details, temple, t, onClose }: BookingConfirmationModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    const { addToast } = useToast();
    
    const deityChant = useMemo<Sloka | null>(() => {
        const deityName = temple?.deity?.toLowerCase();
        if (deityName?.includes('shiva')) {
            return SLOKA_DATA.en.find(s => s.translation.includes('GururBrahma'))!; // Om Namah Shivaya would be better
        }
        if (deityName?.includes('vishnu') || deityName?.includes('krishna') || deityName?.includes('rama')) {
            return SLOKA_DATA.en.find(s => s.translation.includes('Karmanye'))!;
        }
        if (deityName?.includes('ganesha')) {
            return SLOKA_DATA.en.find(s => s.translation.includes('Vakratunda'))!;
        }
        return SLOKA_DATA.en[1]; // Default Gayatri Mantra
    }, [temple]);

    const playChant = () => {
        if (!deityChant) return;
        const utterance = new SpeechSynthesisUtterance(deityChant.text);
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`My booking for ${itemName} is confirmed! View details here: [link]`);
        addToast('Itinerary link copied to clipboard!', 'success');
    };

    const renderDetails = () => {
        if (type === 'Custom Yatra') {
            const d = details as CustomYatraBookingDetails;
            return (
                <div className="text-left space-y-1 text-xs">
                    <p><strong>Type:</strong> Custom Yatra</p>
                    <p><strong>Itinerary:</strong> {d.itinerary.length} temples</p>
                    <p><strong>Travelers:</strong> {d.numberOfPersons}</p>
                    <p><strong>Starts:</strong> {d.startDate.toLocaleDateString()}</p>
                    <p><strong>Transport:</strong> {d.transportMode}</p>
                </div>
            )
        }
        
        const d = details as any;
        const date = d.date ? new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric'}) : '';
        return (
            <div className="text-left space-y-2 text-sm">
                <p><strong>Type:</strong> {type} Booking</p>
                <p><strong>For:</strong> {itemName}</p>
                {d.tier && <p><strong>Tier:</strong> {d.tier.name}</p>}
                {d.pooja && <p><strong>Pooja:</strong> {d.pooja.name}</p>}
                {d.pandit && <p><strong>Pandit:</strong> {d.pandit.name}</p>}
                {date && <p><strong>Date:</strong> {date}</p>}
                {d.timeSlot && <p><strong>Time Slot:</strong> {d.timeSlot}</p>}
                {d.numberOfPersons && <p><strong>Group Size:</strong> {d.numberOfPersons}</p>}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold">&times;</button>
                
                <div className="text-center">
                    <Icon name="bell" className="w-16 h-16 text-primary mx-auto mb-4 animate-bell-shake" style={{animationIterationCount: 1}}/>
                    <h2 id="confirm-modal-title" className="text-3xl font-bold font-heading text-primary">Booking Confirmed!</h2>
                    <p className="text-text-muted mt-2">Your spiritual journey awaits. Here are your details.</p>
                </div>

                <div className="my-6 p-4 bg-white/60 rounded-lg flex items-center gap-4">
                    <img src={QR_CODE_URL} alt="Booking QR Code" className="w-28 h-28 rounded-md border-4 border-white shadow-sm" />
                    <div className="flex-grow">
                        {renderDetails()}
                    </div>
                </div>
                
                {deityChant && (
                    <div className="text-center my-4">
                        <p className="text-sm font-semibold text-text-muted mb-2">A prayer for your journey:</p>
                        <button onClick={playChant} className="flex items-center gap-2 mx-auto text-primary hover:text-secondary transition-colors">
                            <Icon name="speaker" className="w-5 h-5" />
                            <span>Play Deity Chant</span>
                        </button>
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={handleShare} className="w-full bg-primary/20 text-primary font-bold py-3 px-6 rounded-full hover:bg-primary/30 transition-colors">
                        Share Itinerary
                    </button>
                    <button onClick={onClose} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-secondary transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};