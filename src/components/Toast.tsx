import React, { useEffect } from 'react';

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<Props> = ({ message, onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon">✓</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};