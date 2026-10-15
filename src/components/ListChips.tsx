import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ShoppingList } from '../types/shopping';
import { triggerHaptic } from '../lib/telegram';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface Props {
  lists: ShoppingList[];
  activeListId: string;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
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
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [menuBox, setMenuBox] = useState<{ left: number; arrowLeft: number } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const chipsRowRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Передаём ref на контейнер чипсов — хук будет слушать его скролл
  const { isScrolled } = useScrollProgress({
    threshold: 80,
    containerRef: wrapperRef,
  });

  const closeMenu = useCallback(() => {
    setMenu(null);
    setMenuBox(null);
  }, []);

  useEffect(() => {
    if (!menu) return;

    const onOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (chipsRowRef.current?.contains(target)) return;
      closeMenu();
    };

    const onScroll = () => closeMenu();

    document.addEventListener('pointerdown', onOutside, { capture: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (chipsRowRef.current) {
      chipsRowRef.current.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('pointerdown', onOutside, { capture: true });
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll);
      chipsRowRef.current?.removeEventListener('scroll', onScroll);
    };
  }, [menu, closeMenu]);

  useLayoutEffect(() => {
    if (!menu || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const margin = 12;
    const half = rect.width / 2;
    const vw = window.innerWidth;

    const clampedCenter = Math.min(
      Math.max(menu.anchorX, half + margin),
      vw - half - margin
    );
    const left = clampedCenter - half;
    const arrowLeft = half + (menu.anchorX - clampedCenter);

    setMenuBox({ left, arrowLeft });
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

  const handleRename = useCallback(
    (id: string) => {
      if (!editTitle.trim()) {
        setEditingId(null);
        return;
      }
      onRename(id, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
      triggerHaptic('medium');
    },
    [editTitle, onRename]
  );

  const handleDelete = useCallback(
    (id: string, title: string) => {
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
    },
    [closeMenu, onDelete]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: 'create' | 'rename', id?: string) => {
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
    },
    [handleCreate, handleRename]
  );

  const handleChipClick = useCallback(
    (listId: string) => {
      closeMenu();
      onSelect(listId);
    },
    [closeMenu, onSelect]
  );

  const openMenu = useCallback((listId: string, anchor: DOMRect) => {
    setMenu({
      listId,
      anchorX: anchor.left + anchor.width / 2,
      top: anchor.bottom + 8,
    });
    setMenuBox(null);
    triggerHaptic('medium');
  }, []);

  const activeList = lists.find((l) => l.id === activeListId);

  return (
    <div
      className={`list-chips-wrapper ${isScrolled ? 'is-scrolled' : ''}`}
      ref={wrapperRef}
    >
      {/* Ряд чипсов: сворачивается при скролле */}
      <div
        className={`chips-row ${isScrolled ? 'chips-row--collapsed' : ''}`}
        ref={chipsRowRef}
      >
        {lists.map((list) => (
          <div key={list.id} className="chip-wrapper">
            {editingId === list.id ? (
              <input
                type="text"
                className="chip-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleRename(list.id)}
                onKeyDown={(e) => handleKeyDown(e, 'rename', list.id)}
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
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={(e) => handleKeyDown(e, 'create')}
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

      {/* Заголовок: появляется при скролле */}
      {activeList && (
        <div
          className={`scrolled-header ${isScrolled ? 'scrolled-header--visible' : ''}`}
        >
          <div className="scrolled-header-inner">
            <span className="scrolled-title">{activeList.title}</span>
            <span className="scrolled-count">{activeList.items.length}</span>
          </div>
        </div>
      )}

      {/* Меню чипса */}
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
                const target = lists.find((l) => l.id === menu.listId);
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
                  const target = lists.find((l) => l.id === menu.listId);
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

const ChipButton: React.FC<ChipButtonProps> = ({
  list,
  isActive,
  onSelect,
  onLongPress,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isLongPressRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        if (buttonRef.current) {
          onLongPress(list.id, buttonRef.current.getBoundingClientRect());
        }
      }, 500);
    },
    [list.id, onLongPress]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    const deltaX = Math.abs(e.clientX - startPosRef.current.x);
    const deltaY = Math.abs(e.clientY - startPosRef.current.y);

    if (deltaX > 10 || deltaY > 10) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startPosRef.current = null;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isLongPressRef.current) {
      onSelect();
    }

    isLongPressRef.current = false;
    startPosRef.current = null;
  }, [onSelect]);

  const handlePointerLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`list-chip ${isActive ? 'active' : ''}`}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {list.title}
      {list.items.length > 0 && (
        <span className="chip-count">{list.items.length}</span>
      )}
    </button>
  );
};