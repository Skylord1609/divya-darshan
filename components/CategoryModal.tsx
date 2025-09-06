import React, { useState, useRef, useEffect } from 'react';
import { I18nContent, Category } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface CategoryModalProps {
    onClose: () => void;
    onSubmit: (category: Omit<Category, 'id'> | Category) => void;
    initialData?: Category;
    t: I18nContent;
}

const COLORS = [ '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899' ];

export const CategoryModal = ({ onClose, onSubmit, initialData, t }: CategoryModalProps) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setColor(initialData.color);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...(initialData ? { id: initialData.id } : {}),
            name,
            color
        });
    };

    const title = initialData ? t.editCategory : t.addCategory;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-modal-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold">&times;</button>
                <div className="text-center mb-6">
                    <Icon name="edit" className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h2 id="category-modal-title" className="text-3xl font-bold text-primary font-heading">{title}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="category-name" className="block text-sm font-bold text-primary mb-1">{t.categoryName}</label>
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">{t.categoryColor}</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Select color ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg transform hover:scale-105">
                        {t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};
