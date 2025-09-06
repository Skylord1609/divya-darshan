
import React from 'react';
import { Icon } from './Icon';
import type { I18nContent } from '../types';

interface FooterProps {
    t: I18nContent;
}

export const Footer = ({ t }: FooterProps) => {
    return (
        <footer className="bg-secondary/20 border-t-4 border-primary">
            <div className="container mx-auto px-4 py-8 text-center text-text-base">
                <div className="flex flex-col justify-center items-center gap-2 mb-4">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-primary" />
                    <p className="font-heading text-3xl font-semibold text-primary">{t.heroTitle}</p>
                </div>
                <p className="text-sm text-text-muted">{t.footerText}</p>
                <p className="text-xs mt-4 text-text-muted/80">&copy; {new Date().getFullYear()} Divya Darshan. All Rights Reserved.</p>
            </div>
        </footer>
    );
};
