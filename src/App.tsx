import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShoppingList } from './hooks/useShoppingList';
import { ProductInput } from './components/ProductInput';
import { ItemList } from './components/ItemList';
import { ShareButton } from './components/ShareButton';
import { ListChips } from './components/ListChips';
import { Toast } from './components/Toast';
import { Unit } from './types/shopping';

const App: React.FC = () => {
  const {
    list, allLists, activeListId, recentItems, isLoading,
    addItem, toggleItem, removeItem, clearDone,
    setActiveList, createList, renameList, deleteList, removeRecentItem,
  } = useShoppingList();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const blurTimerRef = useRef<number | null>(null);

  const handleFocusChange = useCallback((focused: boolean) => {
    if (blurTimerRef.current !== null) {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    if (focused) {
      setIsInputFocused(true);
    } else {
      blurTimerRef.current = window.setTimeout(() => {
        setIsInputFocused(false);
      }, 150);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  const handleAdd = useCallback(
    async (name: string, qty: string, unit: Unit) => {
      const result = await addItem({ name, qty, unit });
      if (result.wasDuplicate) {
        setToast({ message: 'Товар уже в списке — количество увеличено' });
      }
    },
    [addItem]
  );

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (!list) return <div className="error">Ошибка загрузки данных</div>;

  return (
    <div className="app-container">
      <ListChips
        lists={allLists}
        activeListId={activeListId}
        onSelect={setActiveList}
        onCreate={createList}
        onRename={renameList}
        onDelete={deleteList}
        onFocusChange={handleFocusChange}
      />

      <main className="app-main">
        <ProductInput
          onAdd={handleAdd}
          onFocusChange={handleFocusChange}
          recentItems={recentItems}
          onRemoveRecent={removeRecentItem}
        />
        <ItemList
          items={list.items}
          onToggle={toggleItem}
          onRemove={removeItem}
        />
      </main>

      <ShareButton
        items={list.items}
        listTitle={list.title}
        onClearDone={clearDone}
        isHidden={isInputFocused}
      />

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;