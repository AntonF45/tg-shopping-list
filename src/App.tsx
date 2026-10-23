import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShoppingList } from './hooks/useShoppingList';
import { ProductInput } from './components/ProductInput';
import { ItemList } from './components/ItemList';
import { ShareButton } from './components/ShareButton';
import { ListChips } from './components/ListChips';
import { Toast } from './components/Toast';
import { EditItemModal } from './components/EditItemModal';
import { ShoppingItem, Unit } from './types/shopping'; // <-- 1. Добавлен ShoppingItem

const App: React.FC = () => {
  const {
    list, allLists, activeListId, recentItems, isLoading,
    addItem, toggleItem, removeItem, clearDone,
    setActiveList, createList, renameList, deleteList, 
    removeRecentItem, updateItem
  } = useShoppingList();

  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // 2. Оставлен только один (правильный) вариант состояния toast
  const [toast, setToast] = useState<{ message: string } | null>(null);
  
  // 3. Оставлен только один вариант handleAdd (с useCallback и правильным типом toast)
  const handleAdd = useCallback(
    async (name: string, qty: string, unit: Unit) => {
      const result = await addItem({ name, qty, unit });
      if (result.wasDuplicate) {
        setToast({ message: 'Этот товар уже есть в списке' });
        setTimeout(() => setToast(null), 2500);
      }
    },
    [addItem]
  );

  // 4. Состояние для модального окна редактирования
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const handleEditSave = (id: string, qty: string, unit: Unit) => {
    updateItem(id, { qty, unit });
    setEditingItem(null);
  };

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
          onEdit={setEditingItem} // <-- 5. Передаем функцию открытия модалки
        />
      </main>

      <ShareButton
        items={list.items}
        listTitle={list.title}
        onClearDone={clearDone}
        isHidden={isInputFocused}
      />

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

      {/* 6. Рендерим модальное окно, если есть редактируемый товар */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={handleEditSave}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default App;