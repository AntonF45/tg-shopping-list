import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { ItemRow } from './ItemRow';

interface Props {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ItemList: React.FC<Props> = ({ items, onToggle, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Пока пусто. Добавьте первый товар.</p>
      </div>
    );
  }

  const activeItems = items.filter(i => !i.isDone);
  const doneItems = items.filter(i => i.isDone);

  return (
    <div className="item-list">
      {activeItems.map(item => (
        <ItemRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
      ))}
      
      {doneItems.length > 0 && (
        <>
          <div className="section-divider">Куплено</div>
          {doneItems.map(item => (
            <ItemRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </>
      )}
    </div>
  );
};