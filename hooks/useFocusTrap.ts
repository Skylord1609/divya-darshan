

import React, { useEffect, useRef } from 'react';

export const useFocusTrap = (modalRef: React.RefObject<HTMLElement>) => {
    const firstFocusableElementRef = useRef<HTMLElement | null>(null);
    const lastFocusableElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select'
        );

        if (focusableElements.length > 0) {
            firstFocusableElementRef.current = focusableElements[0];
            lastFocusableElementRef.current = focusableElements[focusableElements.length - 1];
            firstFocusableElementRef.current.focus();
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || !modalNode.contains(document.activeElement)) return;

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElementRef.current) {
                    lastFocusableElementRef.current?.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElementRef.current) {
                    firstFocusableElementRef.current?.focus();
                    event.preventDefault();
                }
            }
        };

        modalNode.addEventListener('keydown', handleKeyDown);

        return () => {
            modalNode.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalRef]);
};