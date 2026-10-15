import { useState, useEffect, useRef, RefObject } from 'react';

interface UseScrollProgressOptions {
  threshold?: number; // px, порог срабатывания
  containerRef?: RefObject<HTMLElement | null>; // опциональный контейнер
}

export const useScrollProgress = ({
  threshold = 80,
  containerRef,
}: UseScrollProgressOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    // Определяем элемент для отслеживания скролла
    const container = containerRef?.current;
    const scrollTarget = container ?? window;

    const checkScroll = () => {
      const scrollY =
        container?.scrollTop ?? window.scrollY ?? 0;
      setIsScrolled(scrollY > threshold);
    };

    const onScroll = () => {
      // requestAnimationFrame для плавности
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

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkScroll);
      tickingRef.current = false;
    };
  }, [threshold, containerRef]);

  return { isScrolled };
};