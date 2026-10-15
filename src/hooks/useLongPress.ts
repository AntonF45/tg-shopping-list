import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // мс
  moveThreshold?: number; // пиксели
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

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isLongPressRef.current = false;
    
    // Запоминаем начальную позицию
    if ('touches' in e) {
      startPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const move = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!startPosRef.current) return;

    let currentX: number;
    let currentY: number;

    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const deltaX = Math.abs(currentX - startPosRef.current.x);
    const deltaY = Math.abs(currentY - startPosRef.current.y);

    // Если палец сдвинулся больше порога — это скролл, отменяем long press
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
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    startPosRef.current = null;
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: stop,
  };
};