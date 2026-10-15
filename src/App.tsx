import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShoppingList } from './hooks/useShoppingList';
import { AddItemForm } from './components/AddItemForm';
import { ItemList } from './components/ItemList';
import { ShareButton } from './components/ShareButton';
import { ListChips } from './components/ListChips';

const App: React.FC = () => {
  const {
    list,
    allLists,
    activeListId,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    clearDone,
    setActiveList,
    createList,
    renameList,
    deleteList,
  } = useShoppingList();

  const [isInputFocused, setIsInputFocused] = useState(false);
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

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!list) {
    return <div className="error">Ошибка загрузки данных</div>;
  }

  return (
    <div className="app-container">
      <ListChips
        lists={allLists}
        activeListId={activeListId}
        onSelect={setActiveList}
        onCreate={createList}
        onRename={renameList}
        onDelete={deleteList}
      />

      <main className="app-main">
        <AddItemForm
          onAdd={(name, qty) => addItem({ name, qty })}
          onFocusChange={handleFocusChange}
        />
        <ItemList items={list.items} onToggle={toggleItem} onRemove={removeItem} />
      </main>

      <ShareButton
        items={list.items}
        onClearDone={clearDone}
        isHidden={isInputFocused}
      />
    </div>
  );
};

export default App;