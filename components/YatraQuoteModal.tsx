import React, { useState, useRef } from 'react';
import { I18nContent, YatraQuoteRequest, User } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icon';

interface YatraQuoteModalProps {
    details: Omit<YatraQuoteRequest, 'userName'|'userEmail'|'userPhone'>;
    t: I18nContent;
    onClose: () => void;
    onSubmit: (details: YatraQuoteRequest) => Promise<void>;
}

export const YatraQuoteModal = ({ details, t, onClose, onSubmit }: YatraQuoteModalProps) => {
    const { currentUser } = useAuth();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const [userName, setUserName] = useState(currentUser?.name || '');
    const [userEmail, setUserEmail] = useState(currentUser?.email || '');
    const [userPhone, setUserPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                ...details,
                userName,
                userEmail,
                userPhone,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="yatra-quote-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 id="yatra-quote-title" className="text-3xl font-bold text-primary font-heading">Finalize Your Yatra Plan</h2>
                    <p className="text-text-muted">Confirm your details to receive quotes from our travel partners.</p>
                </div>

                <div className="bg-white/60 p-4 rounded-lg border border-secondary mb-6">
                    <h3 className="font-bold text-lg mb-2">Your Custom Itinerary:</h3>
                    <ul className="list-disc list-inside text-sm text-text-base space-y-1">
                        {details.itinerary.map(t => <li key={t.id}>{t.name}, {t.location.split(',')[0]}</li>)}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-secondary/30 flex justify-between items-center">
                        <p className="font-semibold">Estimated Cost:</p>
                        <p className="font-bold text-2xl text-primary">₹{details.totalCost.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-1" htmlFor="userName">Full Name</label>
                        <input id="userName" type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full p-2 rounded-lg border-2 border-secondary/50 bg-white" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-primary mb-1" htmlFor="userEmail">Email</label>
                        <input id="userEmail" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full p-2 rounded-lg border-2 border-secondary/50 bg-white" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-primary mb-1" htmlFor="userPhone">Phone Number</label>
                        <input id="userPhone" type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} className="w-full p-2 rounded-lg border-2 border-secondary/50 bg-white" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors disabled:opacity-50 mt-4">
                        {isLoading ? 'Submitting...' : 'Submit to Travel Partners'}
                    </button>
                </form>
            </div>
        </div>
    );
};