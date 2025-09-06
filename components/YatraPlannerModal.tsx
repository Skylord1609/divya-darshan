

import React, { useMemo, useRef } from 'react';
import { I18nContent, YatraPlanItem, PriorityLevel, YatraPlanSettings } from '../types';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { calculateYatraCosts } from './ItineraryCustomizerPanel';

// Card-like component for structure
const PlannerCard = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md ${className}`}>
        <h3 className="text-xl font-bold font-heading text-primary mb-3">{title}</h3>
        {children}
    </div>
);

export const YatraPlannerModal = ({ plan, settings, onRemove, onUpdate, onClose, onOpenPlanner, t }: { 
    plan: YatraPlanItem[], 
    settings: YatraPlanSettings,
    onRemove: (templeId: number) => void, 
    onUpdate: (templeId: number, updates: Partial<Omit<YatraPlanItem, 'temple'>>) => void,
    onClose: () => void, 
    onOpenPlanner: () => void,
    t: I18nContent 
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const priorityOrder: Record<PriorityLevel, number> = useMemo(() => ({ 'High': 1, 'Medium': 2, 'Low': 3 }), []);

    const sortedPlan = useMemo(() => {
        return [...plan].sort((a, b) => {
            const priorityA = priorityOrder[a.priority || 'Medium'];
            const priorityB = priorityOrder[b.priority || 'Medium'];
            return priorityA - priorityB;
        });
    }, [plan, priorityOrder]);

    const { totalCost, totalDays } = useMemo(() => {
        return calculateYatraCosts(plan, settings);
    }, [plan, settings]);
    
    const budgetStatus = useMemo(() => {
        if (!settings.budget || settings.budget === 0) return { text: 'Set a budget in the full planner.', color: 'text-stone-500' };
        const difference = settings.budget - totalCost;
        if (difference >= 0) {
            return { text: `₹${difference.toLocaleString()} under budget`, color: 'text-green-600' };
        }
        return { text: `₹${Math.abs(difference).toLocaleString()} over budget`, color: 'text-red-600' };
    }, [settings.budget, totalCost]);
    
    const priorityClasses: Record<PriorityLevel, { border: string, bg: string, text: string }> = useMemo(() => ({
        'High': { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-500' },
        'Medium': { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-500' },
        'Low': { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-500' },
    }), []);

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="yatra-plan-title" className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b-2 border-amber-200 flex justify-between items-center flex-shrink-0">
                    <h2 id="yatra-plan-title" className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                        <Icon name="compass" className="w-7 h-7" /> My Yatra Plan
                    </h2>
                    <button onClick={onClose} aria-label="Close" className="text-stone-500 hover:text-primary text-2xl font-bold p-1">&times;</button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PlannerCard title="Summary">
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div><dt className="text-sm text-stone-600">Temples</dt><dd className="font-bold text-lg">{plan.length}</dd></div>
                                <div><dt className="text-sm text-stone-600">Est. Days</dt><dd className="font-bold text-lg">{totalDays}</dd></div>
                                <div><dt className="text-sm text-stone-600">Travelers</dt><dd className="font-bold text-lg">{settings.numberOfPersons}</dd></div>
                                <div className="col-span-2"><dt className="text-sm text-stone-600">Est. Cost</dt><dd className="font-bold text-2xl text-primary">₹{totalCost.toLocaleString()}</dd></div>
                            </div>
                        </PlannerCard>
                         <PlannerCard title="Budget Status">
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className={`text-3xl font-bold ${budgetStatus.color}`}>{budgetStatus.text.split(' ')[0]}</p>
                                <p className="text-sm text-stone-600">{budgetStatus.text.split(' ').slice(1).join(' ')}</p>
                                <p className="text-xs text-stone-500 mt-2">Budget: ₹{settings.budget.toLocaleString()}</p>
                            </div>
                        </PlannerCard>
                    </div>

                    <PlannerCard title="Itinerary">
                        {sortedPlan.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {sortedPlan.map(item => (
                                    <div key={item.temple.id} className={`bg-white p-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 border-l-4 ${priorityClasses[item.priority || 'Medium'].border}`}>
                                        <div className="flex-grow">
                                            <p className="font-bold">{item.temple.name}</p>
                                            <p className="text-sm text-stone-500">{item.temple.location}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                                            <div className="flex gap-1">
                                                {(['High', 'Medium', 'Low'] as PriorityLevel[]).map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => onUpdate(item.temple.id, { priority: level })}
                                                        className={`w-7 h-7 rounded-full text-xs font-bold text-white transition-transform transform hover:scale-110 ${priorityClasses[level].bg} ${item.priority === level ? 'ring-2 ring-offset-1 ring-primary' : 'opacity-60'}`}
                                                        title={`Set to ${level} priority`}
                                                        aria-label={`Set ${item.temple.name} priority to ${level}`}
                                                    >
                                                        {level.charAt(0)}
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={() => onRemove(item.temple.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full" title={`Remove ${item.temple.name}`} aria-label={`Remove ${item.temple.name}`}><Icon name="trash" className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-stone-600">Your Yatra plan is empty. Add temples to get started!</p>
                        )}
                    </PlannerCard>
                </div>
                
                <footer className="p-4 border-t-2 border-amber-200 flex-shrink-0 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full sm:w-auto bg-stone-200 text-stone-800 font-bold py-3 px-6 rounded-full hover:bg-stone-300 transition-colors">
                        Close
                    </button>
                    <button onClick={onOpenPlanner} className="w-full sm:flex-grow bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-secondary transition-colors">
                        Open Full Planner
                    </button>
                </footer>
            </div>
        </div>
    );
};