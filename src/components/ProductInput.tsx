import React, { useState, useRef, useEffect } from 'react';
import { Unit } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  onAdd: (name: string, qty: string, unit: Unit) => Promise<void>;
  onFocusChange?: (isFocused: boolean) => void;
  recentItems: string[];
}

const UNITS: Unit[] = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'пач'];

export const ProductInput: React.FC<Props> = ({
  onAdd,
  onFocusChange,
  recentItems,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<Unit>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const filteredItems = recentItems
    .filter(item =>
      item.toLowerCase().includes(name.toLowerCase())
    )
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onAdd(name, qty, unit);
    setName('');
    setQty('');
    setUnit('');
    setShowDropdown(false);
  };

  const handleSelect = (item: string) => {
    setName(item);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const incrementQty = () => {
    const num = parseFloat(qty.replace(',', '.')) || 0;
    const newQty = num + 1;
    setQty(newQty % 1 === 0 ? newQty.toString() : newQty.toFixed(1).replace('.', ','));
    triggerHaptic('light');
  };

  const decrementQty = () => {
    const num = parseFloat(qty.replace(',', '.')) || 0;
    if (num > 0.1) {
      const newQty = num - 1;
      setQty(newQty % 1 === 0 ? newQty.toString() : newQty.toFixed(1).replace('.', ','));
      triggerHaptic('light');
    } else {
      setQty('');
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9,]/g, '');
    setQty(value);
  };

  const handleFocus = () => {
    onFocusChange?.(true);
    setShowDropdown(true);
  };

  const handleBlur = () => {
    onFocusChange?.(false);
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleUnitSelect = (selectedUnit: Unit) => {
    setUnit(selectedUnit);
    triggerHaptic('light');
  };

  return (
    <div className="product-input-container">
      {/* Поле ввода названия */}
      <div className="product-name-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Название товара"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="product-name-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Dropdown с подсказками */}
        {showDropdown && filteredItems.length > 0 && (
          <ul ref={dropdownRef} className="recent-dropdown">
            {filteredItems.map(item => (
              <li
                key={item}
                className="recent-dropdown-item"
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Блок счетчика с единицами измерения */}
      <div className="qty-unit-block">
        <div className="qty-counter-large">
          <button
            type="button"
            className="qty-btn"
            onClick={decrementQty}
            aria-label="Уменьшить количество"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={qty}
            onChange={handleQtyChange}
            className="qty-input-large"
          />

          <button
            type="button"
            className="qty-btn"
            onClick={incrementQty}
            aria-label="Увеличить количество"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Кнопки единиц измерения */}
        <div className="unit-buttons">
          {UNITS.map(u => (
            <button
              key={u}
              type="button"
              className={`unit-btn ${unit === u ? 'unit-btn--active' : ''}`}
              onClick={() => handleUnitSelect(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка добавления (вынесена отдельно) */}
      <button
        type="button"
        className="btn-add-product"
        onClick={handleSubmit}
        disabled={!name.trim()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Добавить</span>
      </button>
    </div>
  );
};