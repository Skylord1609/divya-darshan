
import React, { useRef } from 'react';
import { useInView } from '../hooks/useInView';

interface CardAnimatorProps {
  children: React.ReactNode;
}

export const CardAnimator = ({ children }: CardAnimatorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref, { once: true, threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};