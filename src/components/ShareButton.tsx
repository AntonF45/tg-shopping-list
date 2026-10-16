import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { shareList } from '../lib/share';

interface Props {
  items: ShoppingItem[];
  listTitle?: string; // ← ДОБАВЛЕНО
  onClearDone: () => void;
  isHidden?: boolean;
}

export const ShareButton: React.FC<Props> = ({
  items,
  listTitle = 'Покупки',
  onClearDone,
  isHidden,
}) => {
  const hasDoneItems = items.some(i => i.isDone);

  if (items.length === 0 && !hasDoneItems) {
    return null;
  }

  return (
    <div className={`floating-actions ${isHidden ? 'floating-actions--hidden' : ''}`}>
      <button
        className="btn-share-island"
        onClick={() => shareList(items, { listTitle })}
        type="button"
      >
        <span>Отправить в чат</span>
      </button>

      {hasDoneItems && (
        <button
          className="btn-clear-island"
          onClick={onClearDone}
          type="button"
        >
          <span>Очистить</span>
        </button>
      )}
    </div>
  );
};