import React, { useState, useRef } from 'react';
import { ShoppingItem } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (item: ShoppingItem) => void; // <-- НОВЫЙ ПРОП
}

export const ItemRow: React.FC<Props> = ({ item, onToggle, onRemove, onEdit }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      triggerHaptic('medium');
      onEdit(item);
      setIsPressed(false);
    }, 500); // 500 мс для долгого нажатия
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
  };

  const handleRemove = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.showConfirm) {
      tg.showConfirm(`Удалить "${item.name}"?`, (confirmed: boolean) => {
        if (confirmed) {
          triggerHaptic('medium');
          onRemove(item.id);
        }
      });
    } else {
      if (window.confirm(`Удалить "${item.name}"?`)) {
        triggerHaptic('medium');
        onRemove(item.id);
      }
    }
  };

  return (
    <div 
      className={`checklist-item ${isPressed ? 'checklist-item--pressed' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={e => { e.preventDefault(); onEdit(item); }} // Для десктопа (правая кнопка мыши)
    >
      <input
        type="checkbox"
        id={`item-${item.id}`}
        checked={item.isDone}
        onChange={e => {
          e.stopPropagation(); // Чтобы не триггерить long press при быстром клике
          onToggle(item.id);
        }}
        onPointerDown={e => e.stopPropagation()} // Чекбокс не должен вызывать long press строки
        className="checklist-checkbox"
      />
      <label htmlFor={`item-${item.id}`} className="checklist-label">
        <span className="item-name">{item.name}</span>
        {item.qty && (
          <span className="item-qty">
            — {item.qty}{item.unit && item.unit !== 'шт' ? ` ${item.unit}` : ''}
          </span>
        )}
      </label>
      <button
        type="button"
        className="btn-remove-item"
        onClick={e => {
          e.stopPropagation();
          handleRemove();
        }}
        onPointerDown={e => e.stopPropagation()}
        aria-label="Удалить товар"
      >
        ✕
      </button>
    </div>
  );
};