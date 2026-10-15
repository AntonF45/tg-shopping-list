import React, { useState } from 'react';
import { ShoppingList } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  lists: ShoppingList[];
  activeListId: string;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
}

export const ListChips: React.FC<Props> = ({ lists, activeListId, onSelect, onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) {
      setIsCreating(false);
      return;
    }
    onCreate(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
    triggerHaptic('medium');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewTitle('');
    }
  };

  return (
    <div className="list-chips-container">
      <div className="list-chips-scroll">
        {lists.map(list => (
          <button
            key={list.id}
            className={`list-chip ${list.id === activeListId ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              onSelect(list.id);
            }}
            type="button"
          >
            {list.title}
            {list.items.length > 0 && (
              <span className="chip-count">{list.items.length}</span>
            )}
          </button>
        ))}
        
        {isCreating ? (
          <input
            type="text"
            className="chip-input"
            placeholder="Название"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <button
            className="list-chip list-chip-add"
            onClick={() => {
              setIsCreating(true);
              triggerHaptic('light');
            }}
            type="button"
            aria-label="Добавить список"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};