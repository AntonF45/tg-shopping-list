import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
  moveThreshold?: number;
}

export const useLongPress = ({
  onLongPress,
  onClick,
  threshold = 500,
  moveThreshold = 10,
}: UseLongPressOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Используем ref для хранения актуального onClick (избегаем stale closure)
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const start = useCallback((e: React.PointerEvent) => {
    isLongPressRef.current = false;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const move = useCallback((e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    const deltaX = Math.abs(e.clientX - startPosRef.current.x);
    const deltaY = Math.abs(e.clientY - startPosRef.current.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startPosRef.current = null;
    }
  }, [moveThreshold]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isLongPressRef.current && onClickRef.current) {
      onClickRef.current();
    }
    
    isLongPressRef.current = false;
    startPosRef.current = null;
  }, []);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: stop,
    onPointerLeave: stop,
  };
};