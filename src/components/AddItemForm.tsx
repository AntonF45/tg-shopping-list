import React, { useState, useRef, useEffect } from 'react';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Фильтруем и ограничиваем до 5 элементов
  const filteredItems = recentItems
    .filter(item =>
      item.toLowerCase().includes(name.toLowerCase())
    )
    .slice(0, 5);

  // Закрываем dropdown при клике вне
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name, qty);
    setName('');
    setQty('');
    setShowDropdown(false);
  };

  const handleSelect = async (item: string) => {
    setName(item);
    setShowDropdown(false);
    inputRef.current?.focus();
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

  const handleFocus = () => {
    onFocusChange?.(true);
    setShowDropdown(true);
  };

  const handleBlur = () => {
    onFocusChange?.(false);
    // Не закрываем сразу — даём время на клик по dropdown
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="input-wrapper input-wrapper--dropdown">
        <input
          ref={inputRef}
          type="text"
          placeholder="Название товара"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="input-name"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button type="submit" className="btn-add-circle" disabled={!name.trim()}>
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
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="12" y1="5" x2="12" y2="19"></line>
          </svg>
        </button>

        {/* Кастомный dropdown */}
        {showDropdown && filteredItems.length > 0 && (
          <ul ref={dropdownRef} className="recent-dropdown">
            {filteredItems.map(item => (
              <li
                key={item}
                className="recent-dropdown-item"
                onMouseDown={e => {
                  e.preventDefault(); // Предотвращаем blur инпута
                  handleSelect(item);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="qty-label">Количество</div>

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
          placeholder="Кол-во"
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