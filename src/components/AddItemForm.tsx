import React, { useState } from 'react';

interface Props {
  onAdd: (name: string, qty: string) => void;
}

export const AddItemForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, qty);
    setName('');
    setQty('');
  };

  const incrementQty = () => {
    const num = parseInt(qty) || 0;
    setQty((num + 1).toString());
  };

  const decrementQty = () => {
    const num = parseInt(qty) || 0;
    if (num > 0) {
      setQty((num - 1).toString());
    } else {
      setQty('');
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setQty(value);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          placeholder="Название товара"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-name"
          autoFocus
        />
        <button type="submit" className="btn-add-plus" disabled={!name.trim()}>
          +
        </button>
      </div>
      
      <div className="qty-row">
        <button type="button" className="btn-qty" onClick={decrementQty}>
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Кол-во"
          value={qty}
          onChange={handleQtyChange}
          className="input-qty"
        />
        <button type="button" className="btn-qty" onClick={incrementQty}>
          +
        </button>
      </div>
    </form>
  );
};