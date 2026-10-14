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
    <div className="actions-bar">
      <button 
        className="btn-share" 
        onClick={() => shareList(items)}
        disabled={items.length === 0}
      >
        Отправить в чат
      </button>
      
      {hasDoneItems && (
        <button className="btn-clear" onClick={onClearDone}>
          Очистить купленные
        </button>
      )}
    </div>
  );
};