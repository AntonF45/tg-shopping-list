import React, { useState } from 'react';
import { Category } from '../types/shopping';

interface Props {
  onAdd: (name: string, qty: string, category: Category) => void;
}

export const AddItemForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [category, setCategory] = useState<Category>('groceries');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, qty, category);
    setName('');
    setQty('');
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Название товара"
        value={name}
        onChange={e => setName(e.target.value)}
        className="input-name"
        autoFocus
      />
      <div className="form-row">
        <input
          type="text"
          placeholder="Кол-во (напр. 2 л)"
          value={qty}
          onChange={e => setQty(e.target.value)}
          className="input-qty"
        />
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value as Category)}
          className="input-category"
        >
          <option value="groceries">Еда</option>
          <option value="household">Быт</option>
          <option value="pharmacy">Аптека</option>
          <option value="other">Другое</option>
        </select>
        <button type="submit" className="btn-add" disabled={!name.trim()}>
          +
        </button>
      </div>
    </form>
  );
};