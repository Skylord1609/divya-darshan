import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { Temple, Pooja, Yatra, Book, MajorEvent, Testimonial, Language } from '../types';
import { useToast } from '../contexts/ToastContext';

interface HomePageData {
    temples: Temple[];
    poojas: Pooja[];
    yatras: Yatra[];
    books: Book[];
    events: MajorEvent[];
    testimonials: Testimonial[];
}

interface LoadingStates {
    temples: boolean;
    poojas: boolean;
    yatras: boolean;
    books: boolean;
    events: boolean;
    testimonials: boolean;
}

const initialData: HomePageData = {
    temples: [],
    poojas: [],
    yatras: [],
    books: [],
    events: [],
    testimonials: []
};

const initialLoading: LoadingStates = {
    temples: true,
    poojas: true,
    yatras: true,
    books: true,
    events: true,
    testimonials: true
};

export const useHomePageData = (language: Language) => {
    const [data, setData] = useState<HomePageData>(initialData);
    const [isLoading, setIsLoading] = useState<LoadingStates>(initialLoading);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(initialLoading);
        try {
            const [templesData, poojasData, yatrasData, booksData, eventsData, testimonialsData] = await Promise.all([
                api.getTemples(language),
                api.getPoojas(language),
                api.getYatras(language),
                api.getBooks(language),
                api.getMajorEvents(language),
                api.getTestimonials()
            ]);
            setData({
                temples: templesData,
                poojas: poojasData,
                yatras: yatrasData,
                books: booksData,
                events: eventsData,
                testimonials: testimonialsData
            });
        } catch (error) {
            addToast("Failed to load page content.", "error");
        } finally {
            setIsLoading({ temples: false, poojas: false, yatras: false, books: false, events: false, testimonials: false });
        }
    }, [addToast, language]);

    useEffect(() => {
        fetchData();

        const handleDataUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            const relevantKeys = ['temples', 'poojas', 'yatras', 'books', 'events'];
            if (relevantKeys.includes(customEvent.detail?.key)) {
                fetchData();
            }
        };

        window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);

        return () => {
            window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        };
    }, [fetchData]);

    return { data, isLoading };
};
