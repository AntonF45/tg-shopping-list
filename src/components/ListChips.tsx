import React, { useState } from 'react';
import { ShoppingList } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';

interface Props {
  lists: ShoppingList[];
  activeListId: string;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  isScrolled: boolean;
}

export const ListChips: React.FC<Props> = ({ 
  lists, 
  activeListId, 
  onSelect, 
  onCreate,
  onRename,
  onDelete,
  isScrolled 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

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

  const handleRename = (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    onRename(id, editTitle.trim());
    setEditingId(null);
    setEditTitle('');
    triggerHaptic('medium');
  };

  const handleDelete = (id: string, title: string) => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.showConfirm) {
      tg.showConfirm(`Удалить список "${title}"?`, (confirmed: boolean) => {
        if (confirmed) {
          triggerHaptic('heavy');
          onDelete(id);
        }
      });
    } else {
      if (window.confirm(`Удалить список "${title}"?`)) {
        triggerHaptic('heavy');
        onDelete(id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'create' | 'rename', id?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'create') handleCreate();
      else if (id) handleRename(id);
    } else if (e.key === 'Escape') {
      if (action === 'create') {
        setIsCreating(false);
        setNewTitle('');
      } else {
        setEditingId(null);
        setEditTitle('');
      }
    }
  };

  const activeList = lists.find(l => l.id === activeListId);

  return (
    <div className={`list-chips-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="list-chips-container">
        <div className="list-chips-scroll">
          {lists.map(list => (
            <div key={list.id} className="chip-wrapper">
              {editingId === list.id ? (
                <input
                  type="text"
                  className="chip-input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => handleRename(list.id)}
                  onKeyDown={e => handleKeyDown(e, 'rename', list.id)}
                  autoFocus
                />
              ) : (
                <>
                  <button
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
                  
                  <div className="chip-actions">
                    <button
                      className="chip-action-btn"
                      onClick={() => {
                        setEditingId(list.id);
                        setEditTitle(list.title);
                        triggerHaptic('light');
                      }}
                      type="button"
                      aria-label="Редактировать"
                    >
                      ✏️
                    </button>
                    {lists.length > 1 && (
                      <button
                        className="chip-action-btn chip-action-delete"
                        onClick={() => handleDelete(list.id, list.title)}
                        type="button"
                        aria-label="Удалить"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isCreating ? (
            <input
              type="text"
              className="chip-input"
              placeholder="Название"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={e => handleKeyDown(e, 'create')}
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
      
      {/* Анимированный заголовок при скролле */}
      {isScrolled && activeList && (
        <div className="scrolled-header">
          <span className="scrolled-title">{activeList.title}</span>
          <span className="scrolled-count">{activeList.items.length}</span>
        </div>
      )}
    </div>
  );
};