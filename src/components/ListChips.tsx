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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Состояние для меню (позиция + id списка)
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [menuListId, setMenuListId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (menuListId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuListId]);

  const closeMenu = () => {
    setMenuPosition(null);
    setMenuListId(null);
  };

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
    closeMenu();
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
                  isMenuOpen={menuListId === list.id}
                  onSelect={() => onSelect(list.id)}
                  onLongPress={(button) => {
                    const rect = button.getBoundingClientRect();
                    setMenuPosition({
                      left: rect.left + rect.width / 2,
                      top: rect.top - 8,
                    });
                    setMenuListId(list.id);
                    triggerHaptic('medium');
                  }}
                  onEdit={() => {
                    closeMenu();
                    setEditingId(list.id);
                    setEditTitle(list.title);
                    triggerHaptic('light');
                  }}
                  onDelete={() => handleDelete(list.id, list.title)}
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

      {/* Меню поверх всего */}
      {menuPosition && menuListId && (
        <div
          className="chip-menu-overlay"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <div className="chip-menu" ref={menuRef}>
            <button
              className="chip-menu-item"
              onClick={() => {
                const list = lists.find(l => l.id === menuListId);
                if (list) {
                  setEditingId(list.id);
                  setEditTitle(list.title);
                }
                closeMenu();
                triggerHaptic('light');
              }}
              type="button"
            >
              <span className="menu-icon">✏️</span>
            </button>
            {lists.length > 1 && (
              <button
                className="chip-menu-item chip-menu-delete"
                onClick={() => {
                  const list = lists.find(l => l.id === menuListId);
                  if (list) handleDelete(list.id, list.title);
                }}
                type="button"
              >
                <span className="menu-icon">🗑</span>
              </button>
            )}
          </div>
        </div>
      )}
      
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

interface ChipWithMenuProps {
  list: ShoppingList;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelect: () => void;
  onLongPress: (button: HTMLButtonElement) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ChipWithMenu: React.FC<ChipWithMenuProps> = ({
  list,
  isActive,
  onSelect,
  onLongPress,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (buttonRef.current) {
        onLongPress(buttonRef.current);
      }
    },
    onClick: onSelect, // Без вибрации — только визуальная обратная связь
    threshold: 500,
  });

  return (
    <button
      ref={buttonRef}
      className={`list-chip ${isActive ? 'active' : ''}`}
      {...longPressHandlers}
      type="button"
    >
      {list.title}
      {list.items.length > 0 && (
        <span className="chip-count">{list.items.length}</span>
      )}
    </button>
  );
};