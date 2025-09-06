
import { Pandit, Booking } from '../types';

export interface AvailabilityStatus {
    available: boolean;
    reason: 'BOOKING_CONFLICT' | 'OUTSIDE_HOURS' | 'OFF_DAY' | null;
}


/**
 * Parses a duration string like "Approx 1.5 hours" into minutes.
 * @param duration The string to parse.
 * @returns Duration in minutes, or 60 as a fallback.
 */
export const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 60;
    const matches = duration.match(/(\d+(\.\d+)?)\s*hour/i);
    if (matches && matches[1]) {
        return parseFloat(matches[1]) * 60;
    }
    const minMatches = duration.match(/(\d+)\s*min/i);
    if (minMatches && minMatches[1]) {
        return parseInt(minMatches[1], 10);
    }
    return 60; // Default fallback
};

/**
 * Checks if a pandit is available for a pooja at a specific date and time.
 * Handles split shifts, overnight shifts, and existing booking conflicts.
 * @param pandit The pandit to check.
 * @param poojaDurationMinutes The duration of the pooja.
 * @param requestedDateTime The start date and time of the pooja.
 * @param allBookings All existing bookings to check for conflicts.
 * @returns An object indicating availability and the reason if unavailable.
 */
export const isPanditAvailable = (
    pandit: Pandit,
    poojaDurationMinutes: number,
    requestedDateTime: Date,
    allBookings: Booking[]
): AvailabilityStatus => {
    // 1. Check working days and specific off-dates
    const dayOfWeek = requestedDateTime.getDay(); // Sunday is 0
    if (!pandit.availability.days.includes(dayOfWeek)) {
        return { available: false, reason: 'OFF_DAY' };
    }
    const dateString = requestedDateTime.toISOString().split('T')[0];
    if (pandit.availability.offDates?.includes(dateString)) {
        return { available: false, reason: 'OFF_DAY' };
    }

    // 2. Check working hours, including split and overnight shifts
    const requestedStartMillis = requestedDateTime.getTime();
    const requestedEndMillis = requestedStartMillis + poojaDurationMinutes * 60 * 1000;

    let isWithinWorkingHours = false;
    for (const workPeriod of pandit.availability.hours) {
        const [startH, startM] = workPeriod.start.split(':').map(Number);
        const [endH, endM] = workPeriod.end.split(':').map(Number);
        
        const workStartDateTime = new Date(requestedDateTime);
        workStartDateTime.setHours(startH, startM, 0, 0);

        const workEndDateTime = new Date(requestedDateTime);
        workEndDateTime.setHours(endH, endM, 0, 0);

        // Handle overnight shift (e.g., 22:00 to 04:00)
        if (workEndDateTime.getTime() <= workStartDateTime.getTime()) {
            workEndDateTime.setDate(workEndDateTime.getDate() + 1);
        }
        
        // If the requested time starts before the work shift begins, but spans overnight into the next day's shift start
        // we need to adjust the start time as well to check against the previous day's overnight shift.
        const adjustedWorkStartDateTime = new Date(workStartDateTime);
        if (requestedStartMillis < workStartDateTime.getTime() && workEndDateTime.getDate() > workStartDateTime.getDate()) {
            adjustedWorkStartDateTime.setDate(adjustedWorkStartDateTime.getDate() - 1);
        }

        if (requestedStartMillis >= adjustedWorkStartDateTime.getTime() && requestedEndMillis <= workEndDateTime.getTime()) {
            isWithinWorkingHours = true;
            break; // Found a valid shift, no need to check others
        }
    }

    if (!isWithinWorkingHours) {
        return { available: false, reason: 'OUTSIDE_HOURS' };
    }

    // 3. Check for booking conflicts
    const panditBookings = allBookings.filter(b => 
        ((b.type === 'pandit' && b.itemId === pandit.id) || 
        (b.type === 'pooja' && b.panditId === pandit.id)) && b.bookingDate
    );

    for (const booking of panditBookings) {
        if (!booking.bookingDate || !booking.timeSlot) continue;

        // Create a full Date object for the start of the existing booking
        const bookingStartDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot.split(' - ')[0]}:00`);
        
        const bookingStartMillis = bookingStartDateTime.getTime();
// FIX: Use the actual duration of the booked pooja, not a hardcoded value.
        const bookingDurationMinutes = booking.durationMinutes || 60; // Fallback to 60 mins if not present
        const bookingEndMillis = bookingStartMillis + bookingDurationMinutes * 60 * 1000;

        // Check for overlap: (StartA < EndB) and (EndA > StartB)
        if (requestedStartMillis < bookingEndMillis && requestedEndMillis > bookingStartMillis) {
            return { available: false, reason: 'BOOKING_CONFLICT' };
        }
    }

    return { available: true, reason: null };
};