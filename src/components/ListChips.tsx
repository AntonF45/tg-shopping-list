import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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

interface MenuState {
  listId: string;
  anchorX: number;
  top: number;
}

export const ListChips: React.FC<Props> = ({
  lists,
  activeListId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isScrolled,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [menuBox, setMenuBox] = useState<{ left: number; arrowLeft: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chipsRowRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenu(null);
    setMenuBox(null);
  }, []);

  // Закрытие меню по клику вне, по скроллу и по ресайзу
  useEffect(() => {
    if (!menu) return;

    const onOutside = (e: PointerEvent) => {
      // Проверяем, является ли цель клика чипсом
      const target = e.target as Node;
      const isChip = chipsRowRef.current?.contains(target);
      
      // Если клик по чипсу — не закрываем меню здесь, пусть чипс сам решит
      if (isChip) return;

      if (menuRef.current && !menuRef.current.contains(target)) {
        closeMenu();
      }
    };

    const onScroll = () => closeMenu();

    // Используем pointerdown вместо touchstart/mousedown для единообразия
    document.addEventListener('pointerdown', onOutside, { capture: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onOutside, { capture: true });
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [menu, closeMenu]);

  // Clamp меню по краям экрана
  useLayoutEffect(() => {
    if (!menu || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const margin = 12;
    const half = rect.width / 2;
    const vw = window.innerWidth;

    const clampedLeft = Math.min(Math.max(menu.anchorX, half + margin), vw - half - margin);
    const arrowLeft = half + (menu.anchorX - clampedLeft);

    setMenuBox({ left: clampedLeft, arrowLeft });
  }, [menu]);

  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) {
      setIsCreating(false);
      return;
    }
    onCreate(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
    triggerHaptic('medium');
  }, [newTitle, onCreate]);

  const handleRename = useCallback((id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    onRename(id, editTitle.trim());
    setEditingId(null);
    setEditTitle('');
    triggerHaptic('medium');
  }, [editTitle, onRename]);

  const handleDelete = useCallback((id: string, title: string) => {
    closeMenu();
    const tg = window.Telegram?.WebApp;

    if (tg?.showConfirm) {
      tg.showConfirm(`Удалить список "${title}"?`, (confirmed: boolean) => {
        if (confirmed) {
          triggerHaptic('heavy');
          onDelete(id);
        }
      });
    } else if (window.confirm(`Удалить список "${title}"?`)) {
      triggerHaptic('heavy');
      onDelete(id);
    }
  }, [closeMenu, onDelete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: 'create' | 'rename', id?: string) => {
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
  }, [handleCreate, handleRename]);

  // Обработчик клика по чипсу: закрывает меню И переключает список
  const handleChipClick = useCallback((listId: string) => {
    closeMenu();
    onSelect(listId);
  }, [closeMenu, onSelect]);

  const openMenu = useCallback((listId: string, anchor: DOMRect) => {
    setMenu({
      listId,
      anchorX: anchor.left + anchor.width / 2,
      top: anchor.bottom + 8,
    });
    setMenuBox(null);
    triggerHaptic('medium');
  }, []);

  const activeList = lists.find(l => l.id === activeListId);

  return (
    <div className={`list-chips-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className={`chips-row ${isScrolled ? 'chips-row--collapsed' : ''}`} ref={chipsRowRef}>
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
              <ChipButton
                list={list}
                isActive={list.id === activeListId}
                onSelect={() => handleChipClick(list.id)}
                onLongPress={openMenu}
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

      {activeList && (
        <div className={`scrolled-header ${isScrolled ? 'scrolled-header--visible' : ''}`}>
          <span className="scrolled-title">{activeList.title}</span>
          <span className="scrolled-count">{activeList.items.length}</span>
        </div>
      )}

      {menu && (
        <div
          className="chip-menu-overlay"
          style={{
            left: menuBox ? menuBox.left : menu.anchorX,
            top: menu.top,
            visibility: menuBox ? 'visible' : 'hidden',
          }}
        >
          <div
            className="chip-menu"
            ref={menuRef}
            style={{ '--arrow-left': `${menuBox?.arrowLeft ?? 50}px` } as React.CSSProperties}
          >
            <button
              className="chip-menu-item"
              type="button"
              aria-label="Редактировать список"
              onClick={() => {
                const target = lists.find(l => l.id === menu.listId);
                closeMenu();
                if (target) {
                  setEditingId(target.id);
                  setEditTitle(target.title);
                  triggerHaptic('light');
                }
              }}
            >
              ✏️
            </button>
            {lists.length > 1 && (
              <button
                className="chip-menu-item chip-menu-item--delete"
                type="button"
                aria-label="Удалить список"
                onClick={() => {
                  const target = lists.find(l => l.id === menu.listId);
                  if (target) handleDelete(target.id, target.title);
                }}
              >
                🗑
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChipButtonProps {
  list: ShoppingList;
  isActive: boolean;
  onSelect: () => void;
  onLongPress: (listId: string, anchor: DOMRect) => void;
}

const ChipButton: React.FC<ChipButtonProps> = ({ list, isActive, onSelect, onLongPress }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (buttonRef.current) {
        onLongPress(list.id, buttonRef.current.getBoundingClientRect());
      }
    },
    onClick: onSelect,
    threshold: 500,
  });

  return (
    <button
      ref={buttonRef}
      className={`list-chip ${isActive ? 'active' : ''}`}
      type="button"
      {...longPressHandlers}
    >
      {list.title}
      {list.items.length > 0 && <span className="chip-count">{list.items.length}</span>}
    </button>
  );
};