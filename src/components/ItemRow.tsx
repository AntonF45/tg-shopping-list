import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ItemRow: React.FC<Props> = ({ item, onToggle, onRemove }) => {
  return (
    <div className="checklist-item">
      <input
        type="checkbox"
        checked={item.isDone}
        onChange={() => {
          triggerHaptic('light');
          onToggle(item.id);
        }}
        id={`item-${item.id}`}
        className="checklist-checkbox"
      />
      <label htmlFor={`item-${item.id}`} className="checklist-label">
        <span className="item-name">{item.name}</span>
        {item.qty && <span className="item-qty">× {item.qty}</span>}
      </label>
      <button 
        className="btn-remove-item" 
        onClick={() => {
          triggerHaptic('light');
          onRemove(item.id);
        }}
        aria-label="Удалить"
      >
        
      </button>
    </div>
  );
};