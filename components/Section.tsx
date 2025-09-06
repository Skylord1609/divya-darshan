
import React, { useRef } from 'react';
import { useInView } from '../hooks/useInView';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id: string;
  onViewAll?: () => void;
  viewAllText?: string;
}

export const Section = ({ title, icon, children, id, onViewAll, viewAllText }: SectionProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(titleRef, { once: true, threshold: 0.5 });

  return (
    <section id={id} className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
            <div 
              ref={titleRef}
              className={`flex items-center section-title-animation ${isVisible ? 'is-visible' : ''}`}
            >
              <div className="text-orange-600 mr-3">{icon}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-orange-900">{title}</h2>
            </div>
            {onViewAll && viewAllText && (
                <button onClick={onViewAll} className="bg-orange-100 text-orange-700 font-semibold px-6 py-2 rounded-full text-sm hover:bg-orange-200 transition-colors shadow-sm">
                    {viewAllText} &rarr;
                </button>
            )}
        </div>
        {children}
      </div>
    </section>
  );
};
