import React, { useState, useEffect } from 'react';
import { ShoppingItem, Unit } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  item: ShoppingItem;
  onSave: (id: string, qty: string, unit: Unit) => void;
  onClose: () => void;
}

const UNITS: Unit[] = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'пач'];

export const EditItemModal: React.FC<Props> = ({ item, onSave, onClose }) => {
  const [qty, setQty] = useState(item.qty || '');
  const [unit, setUnit] = useState<Unit>(item.unit || 'шт');

  // Закрытие по Escape (для десктопа)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave(item.id, qty, unit);
    triggerHaptic('light');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Изменить: {item.name}</h3>
        
        <div className="modal-field">
          <label className="modal-label">Количество</label>
          <input
            type="text"
            inputMode="decimal"
            value={qty}
            onChange={e => setQty(e.target.value.replace(/[^0-9,]/g, ''))}
            className="modal-input"
            placeholder="0"
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Единица измерения</label>
          <select
            value={unit}
            onChange={e => {
              setUnit(e.target.value as Unit);
              triggerHaptic('light');
            }}
            className="modal-select"
          >
            {UNITS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="modal-btn modal-btn--save" onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};