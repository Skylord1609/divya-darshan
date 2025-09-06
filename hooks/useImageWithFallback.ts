import { useState, useEffect, useCallback } from 'react';

type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * A custom hook to reliably handle image source fallbacks with loading states.
 * @param defaultSrc The primary image URL.
 * @param fallbackSrc The URL to use if the primary one fails.
 * @returns An object with the current `imgSrc`, `status`, and event handlers.
 */
export const useImageWithFallback = (defaultSrc: string, fallbackSrc: string) => {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [currentSrc, setCurrentSrc] = useState(defaultSrc || fallbackSrc);

  useEffect(() => {
    setStatus('loading');
    setCurrentSrc(defaultSrc || fallbackSrc);
  }, [defaultSrc, fallbackSrc]);
  
  const onLoad = useCallback(() => {
    setStatus('loaded');
  }, []);

  const onError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
    } else {
        setStatus('error');
    }
  }, [currentSrc, fallbackSrc]);
  
  return { imgSrc: currentSrc, status, onLoad, onError };
};
