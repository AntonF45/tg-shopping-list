import { useState, useEffect, useCallback } from 'react';
import { ShoppingList, AddItemInput } from '../types/shopping';
import { localStorageRepository } from '../storage/localStorageRepository';
import { logEvent, getInitialListLength } from '../lib/analytics';
import { triggerHaptic } from '../lib/telegram';

export const useShoppingList = () => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [allLists, setAllLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const store = await localStorageRepository.getAllLists();
    const activeList = await localStorageRepository.getActiveList();
    
    setAllLists(store.lists);
    setActiveListId(store.activeListId);
    setList(activeList);
    setIsLoading(false);
    
    const initialLength = await getInitialListLength();
    logEvent('app_opened', { totalItems: initialLength });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = useCallback(async (input: AddItemInput) => {
    if (!input.name.trim()) return;
    
    const initialLength = list?.items.length || 0;
    const newItem = await localStorageRepository.addItem(input);
    
    setList(prev => prev ? { ...prev, items: [...prev.items, newItem] } : null);
    setAllLists(prev => prev.map(l => 
      l.id === activeListId 
        ? { ...l, items: [...l.items, newItem] }
        : l
    ));
    triggerHaptic('light');
    
    logEvent(initialLength === 0 ? 'first_item_added' : 'item_added', {
      hasQty: !!input.qty,
      category: input.category,
      totalItems: initialLength + 1
    });
  }, [list?.items.length, activeListId]);

  const toggleItem = useCallback(async (id: string) => {
    const updatedItem = await localStorageRepository.toggleItem(id);
    setList(prev => {
      if (!prev) return null;
      const newItems = prev.items.map(i => i.id === id ? updatedItem : i);
      return { ...prev, items: newItems };
    });
    setAllLists(prev => prev.map(l => 
      l.id === activeListId 
        ? { ...l, items: l.items.map(i => i.id === id ? updatedItem : i) }
        : l
    ));
    triggerHaptic('medium');
    logEvent('item_marked_done');
  }, [activeListId]);

  const removeItem = useCallback(async (id: string) => {
    await localStorageRepository.removeItem(id);
    setList(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== id) } : null);
    setAllLists(prev => prev.map(l => 
      l.id === activeListId 
        ? { ...l, items: l.items.filter(i => i.id !== id) }
        : l
    ));
    triggerHaptic('light');
    logEvent('item_removed');
  }, [activeListId]);

  const clearDone = useCallback(async () => {
    if (!window.confirm('Удалить все купленные товары?')) return;
    await localStorageRepository.clearDone();
    setList(prev => prev ? { ...prev, items: prev.items.filter(i => !i.isDone) } : null);
    setAllLists(prev => prev.map(l => 
      l.id === activeListId 
        ? { ...l, items: l.items.filter(i => !i.isDone) }
        : l
    ));
    triggerHaptic('heavy');
    logEvent('list_cleared');
  }, [activeListId]);

  const setActiveList = useCallback(async (id: string) => {
    await localStorageRepository.setActiveList(id);
    const store = await localStorageRepository.getAllLists();
    const newList = store.lists.find(l => l.id === id);
    if (newList) {
      setList(newList);
      setActiveListId(id);
      triggerHaptic('light');
    }
  }, []);

  const createList = useCallback(async (title: string) => {
    const newList = await localStorageRepository.createList(title);
    const store = await localStorageRepository.getAllLists();
    setAllLists(store.lists);
    setList(newList);
    setActiveListId(newList.id);
    logEvent('list_created');
  }, []);

  return { 
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
  };
};