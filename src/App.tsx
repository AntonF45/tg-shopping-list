import React, { useState, useEffect } from 'react';
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
    createList
  } = useShoppingList();
  
  const [isInputFocused, setIsInputFocused] = useState(false);

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!list) {
    return <div className="error">Ошибка загрузки данных</div>;
  }

  return (
    <div className={`app-container ${isInputFocused ? 'input-focused' : ''}`}>
      <header className="app-header">
        <h1>{list.title}</h1>
        <span className="item-count">{list.items.length}</span>
      </header>
      
      <ListChips
        lists={allLists}
        activeListId={activeListId}
        onSelect={setActiveList}
        onCreate={createList}
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