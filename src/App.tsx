import React, { useState } from 'react';
import { useShoppingList } from './hooks/useShoppingList';
import { AddItemForm } from './components/AddItemForm';
import { ItemList } from './components/ItemList';
import { ShareButton } from './components/ShareButton';
import { ListChips } from './components/ListChips';
import { useScrollProgress } from './hooks/useScrollProgress';

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
    deleteList
  } = useShoppingList();
  
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { isScrolled } = useScrollProgress();

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!list) {
    return <div className="error">Ошибка загрузки данных</div>;
  }

  return (
    <div className={`app-container ${isInputFocused ? 'input-focused' : ''}`}>
      <ListChips
        lists={allLists}
        activeListId={activeListId}
        onSelect={setActiveList}
        onCreate={createList}
        onRename={renameList}
        onDelete={deleteList}
        isScrolled={isScrolled}
      />
      
      <main className="app-main">
        <AddItemForm 
          onAdd={(name, qty) => addItem({ name, qty })} 
          onFocusChange={setIsInputFocused}
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