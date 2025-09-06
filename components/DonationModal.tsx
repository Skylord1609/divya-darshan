
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Temple, I18nContent, DonationOption } from '../types';
import { Icon } from './Icon';
import { DONATION_OPTIONS } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface DonationModalProps {
    temple?: Temple | null;
    t: I18nContent;
    onClose: () => void;
    onConfirm: (amount: number, purpose: DonationOption) => Promise<void>;
}

export const DonationModal = ({ temple, onClose, onConfirm, t }: DonationModalProps) => {
    const [amount, setAmount] = useState<number | ''>(501);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const purposeOptions = useMemo(() => temple
        ? DONATION_OPTIONS.filter(opt => opt.id === 'templeMaintenance' || opt.id === 'general')
        : DONATION_OPTIONS, [temple]);

    const [selectedPurpose, setSelectedPurpose] = useState<DonationOption>(purposeOptions[0]);

    // This effect ensures the state is reset when the available options change.
    useEffect(() => {
        if (purposeOptions.length > 0 && !purposeOptions.some(p => p.id === selectedPurpose.id)) {
            setSelectedPurpose(purposeOptions[0]);
        }
    }, [purposeOptions, selectedPurpose]);

    const predefinedAmounts = [101, 251, 501, 1001, 2501];

    const handleAmountSelect = (selectedAmount: number) => {
        setAmount(selectedAmount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(value);
        if (value) {
            setAmount(parseInt(value, 10));
        } else {
            setAmount('');
        }
    };
    
    const handleSubmit = async () => {
        if (!amount || amount < 11) {
            addToast("Minimum donation amount is ₹11.", 'info');
            return;
        }
        if (!selectedPurpose) {
             addToast("Please select a purpose for your donation.", 'info');
            return;
        }

        setIsLoading(true);
        try {
            await onConfirm(amount, selectedPurpose);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="donation-modal-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold z-10"
                >&times;</button>

                <div className="text-center mb-6">
                    <Icon name="heart-hand" className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                    <h2 id="donation-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{t.makeDonation}</h2>
                    {temple && <p className="text-stone-600">to <span className="font-semibold">{temple.name}</span></p>}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">{t.donationAmount} (INR)</label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {predefinedAmounts.map(predefinedAmount => (
                                <button
                                    key={predefinedAmount}
                                    onClick={() => handleAmountSelect(predefinedAmount)}
                                    className={`p-3 text-center rounded-lg font-bold transition-colors ${amount === predefinedAmount ? 'bg-orange-600 text-white' : 'bg-white hover:bg-orange-100'}`}
                                >
                                    ₹{predefinedAmount}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="Or enter custom amount"
                            className="w-full p-3 rounded-lg border-2 border-orange-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm mt-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-orange-800 mb-2">{t.donationPurpose}</label>
                        <div className="space-y-2">
                             {purposeOptions.map(option => (
                                <div key={option.id}
                                    onClick={() => setSelectedPurpose(option)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPurpose.id === option.id ? 'border-orange-500 bg-orange-100/50' : 'border-orange-200 bg-white hover:border-orange-300'}`}
                                >
                                    <label className="flex items-center w-full cursor-pointer">
                                        <input 
                                            type="radio"
                                            name="donation-purpose"
                                            value={option.id}
                                            checked={selectedPurpose.id === option.id}
                                            onChange={() => setSelectedPurpose(option)}
                                            className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                                        />
                                        <div className="ml-3">
                                            <span className="font-bold text-stone-800">{t[option.title as keyof typeof t]}</span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={isLoading || !amount}
                    className="w-full mt-8 bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg transform hover:scale-105 disabled:bg-orange-400 disabled:cursor-wait"
                >
                    {isLoading ? 'Processing...' : `${t.donateNow} (₹${amount || 0})`}
                </button>
            </div>
        </div>
    );
};