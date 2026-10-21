import React from 'react';
import { ShoppingItem } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ItemRow: React.FC<Props> = ({ item, onToggle, onRemove }) => {
  const handleRemove = () => {
    const tg = window.Telegram?.WebApp;
    
    // Используем нативный диалог Telegram, если доступен
    if (tg?.showConfirm) {
      tg.showConfirm(`Удалить "${item.name}"?`, (confirmed: boolean) => {
        if (confirmed) {
          triggerHaptic('medium');
          onRemove(item.id);
        }
      });
    } else {
      // Фоллбэк для обычного браузера
      if (window.confirm(`Удалить "${item.name}"?`)) {
        triggerHaptic('medium');
        onRemove(item.id);
      }
    }
  };

  return (
    <div className="checklist-item">
      <input
        type="checkbox"
        checked={item.isDone}
        onChange={() => onToggle(item.id)}
        className="checklist-checkbox"
      />
      <label className="checklist-label">
        <span className="item-name">{item.name}</span>
        {item.qty && (
          <span className="item-qty">
            — {item.qty}{item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
      </label>
      <button
        type="button"
        className="btn-remove-item"
        onClick={handleRemove}
        aria-label="Удалить товар"
      >
        ✕
      </button>
    </div>
  );
};