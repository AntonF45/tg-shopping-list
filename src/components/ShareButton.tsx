import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { shareList } from '../lib/share';

interface Props {
  items: ShoppingItem[];
  onClearDone: () => void;
}

export const ShareButton: React.FC<Props> = ({ items, onClearDone }) => {
  const hasDoneItems = items.some(i => i.isDone);

  return (
    <div className="floating-actions">
      {items.length > 0 && (
        <button 
          className="btn-share-island" 
          onClick={() => shareList(items)}
        >
          <span className="btn-icon"></span>
          <span>Отправить в чат</span>
        </button>
      )}
      
      {hasDoneItems && (
        <button className="btn-clear-island" onClick={onClearDone}>
          <span className="btn-icon">🗑</span>
          <span>Очистить</span>
        </button>
      )}
    </div>
  );
};