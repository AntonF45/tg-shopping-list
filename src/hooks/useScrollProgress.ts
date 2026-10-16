import { useState, useEffect, useRef, RefObject } from 'react';

interface UseScrollProgressOptions {
  threshold?: number;
  containerRef?: RefObject<HTMLElement | null>;
}

export const useScrollProgress = ({
  threshold = 60,
  containerRef,
}: UseScrollProgressOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const checkScroll = () => {
      // Проверяем скролл у window (основной источник в TMA)
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const shouldScroll = scrollY > threshold;
      
      console.log('[Scroll] scrollY:', scrollY, 'threshold:', threshold, 'isScrolled:', shouldScroll);
      
      setIsScrolled(shouldScroll);
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          checkScroll();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    // Первичная проверка
    checkScroll();

    // Слушаем скролл у window (работает в 99% случаев в TMA)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    // Дополнительно слушаем скролл у containerRef, если он есть
    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkScroll);
      if (container) {
        container.removeEventListener('scroll', onScroll);
      }
      tickingRef.current = false;
    };
  }, [threshold, containerRef]);

  return { isScrolled };
};