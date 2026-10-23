import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { ItemRow } from './ItemRow';

interface Props {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (item: ShoppingItem) => void; // <-- 1. ДОБАВИТЬ В ИНТЕРФЕЙС
}

export const ItemList: React.FC<Props> = ({ 
  items, 
  onToggle, 
  onRemove, 
  onEdit // <-- 2. ДОБАВИТЬ В ДЕСТРУКТУРИЗАЦИЮ
}) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        Список пуст. Добавьте первый товар выше.
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map(item => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
          onEdit={onEdit} // <-- 3. ПЕРЕДАТЬ В ItemRow
        />
      ))}
    </div>
  );
};