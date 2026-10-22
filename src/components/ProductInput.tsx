import React, { useState, useRef, useEffect } from 'react';
import { Unit } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  onAdd: (name: string, qty: string, unit: Unit) => Promise<void>;
  onFocusChange?: (isFocused: boolean) => void;
  recentItems: string[];
  onRemoveRecent?: (name: string) => void | Promise<void>;
}

const UNITS: Unit[] = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'пач'];

export const ProductInput: React.FC<Props> = ({
  onAdd,
  onFocusChange,
  recentItems,
  onRemoveRecent,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<Unit>('шт'); // По умолчанию "шт"
  const [showQty, setShowQty] = useState(false); // По умолчанию скрыто
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const filteredItems = recentItems
    .filter(item => item.toLowerCase().includes(name.toLowerCase()))
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
    setUnit('шт'); // Сброс к значению по умолчанию
    setShowDropdown(false);
    triggerHaptic('medium');
  };

  const handleSelect = (item: string) => {
    setName(item);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleClearName = () => {
  setName('');
  setShowDropdown(true); // после очистки показываем недавние товары
  triggerHaptic('light');
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

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnit(e.target.value as Unit);
    triggerHaptic('light');
  };

  const toggleQty = () => {
    setShowQty(!showQty);
    triggerHaptic('light');
  };

    return (
    <div className="product-input-container">
      {/* Верхняя строка: название + кнопка добавить */}
      <div className="product-top-row">
        <div className="product-name-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Название товара"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="product-name-input"
            autoComplete="on"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
            enterKeyHint="done"
          />

          {/* Крестик очистки — появляется только когда есть текст */}
          {name && (
            <button
              type="button"
              className="btn-clear-input"
              onMouseDown={e => e.preventDefault()} /* не отбираем фокус у поля */
              onClick={handleClearName}
              aria-label="Очистить поле"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

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
                  <span className="recent-dropdown-name">{item}</span>

                  {/* Крестик удаления из памяти подсказок */}
                  <button
                    type="button"
                    className="btn-remove-recent"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation(); // не выбираем товар при клике на крестик
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onRemoveRecent?.(item);
                    }}
                    aria-label={`Удалить «${item}» из подсказок`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="btn-add-product"
          onClick={handleSubmit}
          disabled={!name.trim()}
          aria-label="Добавить товар"
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

      {/* Сворачиваемый блок: количество и единицы в одной строке */}
      <div className={`qty-unit-block ${showQty ? 'qty-unit-block--visible' : ''}`}>
        <div className="qty-unit-block-inner">
          <div className="qty-counter-compact">
            <button
              type="button"
              className="qty-btn"
              onClick={decrementQty}
              aria-label="Уменьшить количество"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={qty}
              onChange={handleQtyChange}
              onFocus={() => onFocusChange?.(true)}
              onBlur={() => onFocusChange?.(false)}
              className="qty-input-compact"
            />

            <button
              type="button"
              className="qty-btn"
              onClick={incrementQty}
              aria-label="Увеличить количество"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <select
              value={unit}
              onChange={handleUnitChange}
              className="unit-select"
            >
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Строка-аккордеон вместо язычка */}
      <button
        type="button"
        className="qty-accordion-header"
        onClick={toggleQty}
        aria-expanded={showQty}
        aria-label={showQty ? 'Скрыть количество' : 'Показать количество'}
      >
        <svg
          className={`qty-toggle-icon ${showQty ? 'qty-toggle-icon--open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};