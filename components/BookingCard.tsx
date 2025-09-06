

import React from 'react';
import { Booking, I18nContent } from '../types';
import { Icon } from './Icon';
import { DONATION_OPTIONS } from '../constants';

interface BookingCardProps {
    booking: Booking;
    t: I18nContent;
}

const getBookingIcon = (type: Booking['type']) => {
    const commonClass = "w-8 h-8 text-orange-600";
    const iconNameMap: Record<Booking['type'], React.ReactNode> = {
        'pooja': <Icon name="bell" className={commonClass} />,
        'darshan': <Icon name="temple" className={commonClass} />,
        'pandit': <Icon name="users" className={commonClass} />,
        'donation': <Icon name="heart-hand" className={commonClass} />,
        'yatra': <Icon name="compass" className={commonClass} />,
        'custom_yatra': <Icon name="compass" className={commonClass} />,
    };
    return iconNameMap[type] || <Icon name="receipt" className={commonClass} />;
};

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (timestamp: string) => {
     return new Date(timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export const BookingCard = React.memo(({ booking, t }: BookingCardProps) => {
    
    const getBookingDetails = () => {
        if (booking.type === 'donation') {
            const generalDonation = DONATION_OPTIONS.find(opt => opt.title === booking.itemName);
            if (generalDonation) {
                return {
                    title: t[generalDonation.title as keyof typeof t] || booking.itemName,
                    context: ''
                };
            }
        }

        if (booking.type === 'pooja') {
            return {
                title: booking.itemName,
                context: `at ${booking.itemContext}` // Temple name is in context
            }
        }

        if (booking.type === 'yatra') {
            const personsText = booking.numberOfPersons === 1 ? '1 person' : `${booking.numberOfPersons} persons`;
            return {
                title: booking.itemName,
                context: `(${booking.itemContext}) for ${personsText}`
            };
        }

        return {
            title: booking.itemName,
            context: booking.itemContext || ''
        };
    };

    const { title: titleText, context: contextText } = getBookingDetails();

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-amber-200 hover:shadow-lg hover:border-amber-400 transition-all duration-300 flex items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0 bg-amber-100 p-3 rounded-full">
                {getBookingIcon(booking.type)}
            </div>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                <div className="sm:col-span-2">
                    <p className="font-bold text-lg text-stone-800">{titleText} <span className="text-stone-500 font-normal text-base">{contextText}</span></p>
                    <div className="text-sm text-stone-500 flex flex-wrap gap-x-4">
                        <p>Booked on: {formatDate(booking.timestamp)}</p>
                        {booking.bookingDate && <p className="font-semibold">{booking.type === 'yatra' || booking.type === 'custom_yatra' ? 'Departure' : 'Visit'}: {formatDate(booking.bookingDate)} {booking.timeSlot ? `at ${booking.timeSlot}` : ''}</p>}
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="font-bold text-xl text-orange-800">{formatCurrency(booking.cost)}</p>
                    <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
                        {booking.type.replace('_', ' ')}
                    </p>
                </div>
            </div>
        </div>
    );
});

BookingCard.displayName = 'BookingCard';
