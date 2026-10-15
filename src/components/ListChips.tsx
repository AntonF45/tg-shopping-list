import React, { useState, useEffect, useRef } from 'react';
import { ShoppingList } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';
import { useLongPress } from '../hooks/useLongPress';

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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

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
    setMenuOpenId(null);
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
                <ChipWithMenu
                  list={list}
                  isActive={list.id === activeListId}
                  isMenuOpen={menuOpenId === list.id}
                  onSelect={() => {
                    triggerHaptic('light');
                    onSelect(list.id);
                  }}
                  onLongPress={() => {
                    setMenuOpenId(list.id);
                    triggerHaptic('medium');
                  }}
                  onEdit={() => {
                    setMenuOpenId(null);
                    setEditingId(list.id);
                    setEditTitle(list.title);
                    triggerHaptic('light');
                  }}
                  onDelete={() => handleDelete(list.id, list.title)}
                  menuRef={menuRef}
                />
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

// Отдельный компонент для чипса с меню
interface ChipWithMenuProps {
  list: ShoppingList;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelect: () => void;
  onLongPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const ChipWithMenu: React.FC<ChipWithMenuProps> = ({
  list,
  isActive,
  isMenuOpen,
  onSelect,
  onLongPress,
  onEdit,
  onDelete,
  menuRef,
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: onLongPress,
    onClick: onSelect,
    threshold: 500,
  });

  return (
    <>
      <button
        className={`list-chip ${isActive ? 'active' : ''}`}
        {...longPressHandlers}
        type="button"
      >
        {list.title}
        {list.items.length > 0 && (
          <span className="chip-count">{list.items.length}</span>
        )}
      </button>

      {isMenuOpen && (
        <div className="chip-menu" ref={menuRef}>
          <button
            className="chip-menu-item"
            onClick={onEdit}
            type="button"
          >
            <span className="menu-icon">✏️</span>
            <span>Редактировать</span>
          </button>
          {list.items.length === 0 && (
            <button
              className="chip-menu-item chip-menu-delete"
              onClick={onDelete}
              type="button"
            >
              <span className="menu-icon">🗑</span>
              <span>Удалить</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};