import React, { useState, useRef } from 'react';
import { I18nContent, Pooja, MajorEvent, Task, Category } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface TaskModalProps {
    item: Pooja | MajorEvent;
    itemType: 'Pooja' | 'Event';
    categories: Category[];
    t: I18nContent;
    onClose: () => void;
    onConfirm: (task: Omit<Task, 'id'>) => void;
}

export const TaskModal = ({ item, itemType, categories, t, onClose, onConfirm }: TaskModalProps) => {
    const now = new Date();
    // Set default to 1 hour from now, formatting for datetime-local
    now.setHours(now.getHours() + 1);
    const defaultDateTime = now.toISOString().slice(0, 16);

    const [dateTime, setDateTime] = useState(defaultDateTime);
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            itemId: item.id,
            itemType,
            itemName: item.name,
            dateTime,
            note,
            categoryId: categoryId ? parseInt(categoryId, 10) : undefined
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-modal-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold">&times;</button>
                <div className="text-center mb-6">
                    <Icon name="bell" className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 id="task-modal-title" className="text-3xl font-bold text-primary font-heading">{t.setTask}</h2>
                    <p className="text-text-muted">{t.taskFor} <span className="font-semibold">{item.name}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="task-datetime" className="block text-sm font-bold text-primary mb-1">{t.taskDateTime}</label>
                        <input
                            id="task-datetime"
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="task-category" className="block text-sm font-bold text-primary mb-1">Category</label>
                        <select
                            id="task-category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                        >
                            <option value="">{t.uncategorized}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="task-note" className="block text-sm font-bold text-primary mb-1">{t.taskNote}</label>
                        <textarea
                            id="task-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t.taskNotePlaceholder}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                            rows={3}
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg transform hover:scale-105">
                        {t.confirmTask}
                    </button>
                </form>
            </div>
        </div>
    );
};