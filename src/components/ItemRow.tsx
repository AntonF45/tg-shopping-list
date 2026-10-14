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
    <div className={`item-row ${item.isDone ? 'done' : ''}`}>
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={item.isDone}
          onChange={() => onToggle(item.id)}
        />
        <span className="checkmark"></span>
      </label>
      
      <div className="item-info" onClick={() => onToggle(item.id)}>
        <span className="item-name">{item.name}</span>
        {item.qty && <span className="item-qty">{item.qty}</span>}
      </div>
      
      <button 
        className="btn-remove" 
        onClick={() => {
          triggerHaptic('light');
          onRemove(item.id);
        }}
        aria-label="Удалить"
      >
        ✕
      </button>
    </div>
  );
};