

import React, { useState, useEffect, useRef } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  once?: boolean;
}

export const useInView = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverOptions = { once: true, threshold: 0.1 }
) => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else {
            if(!options.once) {
                setIsVisible(false);
            }
        }
      },
      {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      }
    );
    observerRef.current = observer;

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, options.threshold, options.rootMargin, options.root, options.once]);

  return isVisible;
};