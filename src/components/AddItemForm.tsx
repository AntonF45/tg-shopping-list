import React, { useState } from 'react';

interface Props {
  onAdd: (name: string, qty: string) => Promise<void>;
  onFocusChange?: (isFocused: boolean) => void;
  recentItems: string[];
}

export const AddItemForm: React.FC<Props> = ({
  onAdd,
  onFocusChange,
  recentItems,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name, qty);
    setName('');
    setQty('');
  };

  const incrementQty = () => {
    const num = parseInt(qty) || 0;
    setQty((num + 1).toString());
  };

  const decrementQty = () => {
    const num = parseInt(qty) || 0;
    if (num > 1) {
      setQty((num - 1).toString());
    } else {
      setQty('');
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setQty(value);
  };

  const handleFocus = () => onFocusChange?.(true);
  const handleBlur = () => onFocusChange?.(false);

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          type="text"
          placeholder="Название товара"
          value={name}
          list="recent-items-list"
          onChange={e => setName(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="input-name"
          autoFocus
          autoComplete="off"
        />
        <button type="submit" className="btn-add-circle" disabled={!name.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="12" y1="5" x2="12" y2="19"></line>
          </svg>
        </button>
      </div>

      {/* Показываем datalist только после начала ввода */}
      {name.length > 0 && (
        <datalist id="recent-items-list">
          {recentItems.map((item: string) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      )}

      <div className="qty-counter">
        <button
          type="button"
          className="btn-counter btn-counter-left"
          onClick={decrementQty}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1h16"></path>
          </svg>
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={qty}
          onChange={handleQtyChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="input-counter"
        />
        <button
          type="button"
          className="btn-counter btn-counter-right"
          onClick={incrementQty}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 1v16M1 9h16"></path>
          </svg>
        </button>
      </div>
    </form>
  );
};