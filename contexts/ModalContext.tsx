import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { ModalType, ModalContextType } from '../types';

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [modalProps, setModalProps] = useState<any>({});
    const modalTriggerRef = useRef<HTMLElement | null>(null);

    const openModal = useCallback((type: ModalType, props: any = {}) => {
        modalTriggerRef.current = document.activeElement as HTMLElement;
        setModalType(type);
        setModalProps(props);
    }, []);

    const closeModal = useCallback(() => {
        setModalType(null);
        setModalProps({});
        modalTriggerRef.current?.focus();
    }, []);

    const value = {
        modalType,
        modalProps,
        openModal,
        closeModal,
    };

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
