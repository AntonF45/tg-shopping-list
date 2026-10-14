import React from 'react';
import { useShoppingList } from './hooks/useShoppingList';
import { AddItemForm } from './components/AddItemForm';
import { ItemList } from './components/ItemList';
import { ShareButton } from './components/ShareButton';

const App: React.FC = () => {
  const { list, isLoading, addItem, toggleItem, removeItem, clearDone } = useShoppingList();

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!list) {
    return <div className="error">Ошибка загрузки данных</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{list.title}</h1>
        <span className="item-count">{list.items.length}</span>
      </header>
      
      <main className="app-main">
        <AddItemForm onAdd={(name, qty, category) => addItem({ name, qty, category })} />
        <ItemList items={list.items} onToggle={toggleItem} onRemove={removeItem} />
      </main>
      
      <footer className="app-footer">
        <ShareButton items={list.items} onClearDone={clearDone} />
      </footer>
    </div>
  );
};

export default App;