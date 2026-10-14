import { useState, useEffect, useCallback } from 'react';
import { ShoppingList, AddItemInput } from '../types/shopping';
import { localStorageRepository } from '../storage/localStorageRepository';
import { logEvent, getInitialListLength } from '../lib/analytics';
import { triggerHaptic } from '../lib/telegram';

export const useShoppingList = () => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await localStorageRepository.getList();
      setList(data);
      setIsLoading(false);
      
      const initialLength = await getInitialListLength();
      logEvent('app_opened', { totalItems: initialLength });
    };
    load();
  }, []);

  const addItem = useCallback(async (input: AddItemInput) => {
    if (!input.name.trim()) return;
    
    const initialLength = list?.items.length || 0;
    const newItem = await localStorageRepository.addItem(input);
    
    setList(prev => prev ? { ...prev, items: [...prev.items, newItem] } : null);
    triggerHaptic('light');
    
    logEvent(initialLength === 0 ? 'first_item_added' : 'item_added', {
      hasQty: !!input.qty,
      category: input.category,
      totalItems: initialLength + 1
    });
  }, [list?.items.length]);

  const toggleItem = useCallback(async (id: string) => {
    const updatedItem = await localStorageRepository.toggleItem(id);
    setList(prev => {
      if (!prev) return null;
      const newItems = prev.items.filter(i => i.id !== id).concat(updatedItem);
      // Сортировка уже сделана в репозитории, но для реактивности обновляем массив
      newItems.sort((a, b) => {
        if (a.isDone === b.isDone) return b.createdAt - a.createdAt;
        return a.isDone ? 1 : -1;
      });
      return { ...prev, items: newItems };
    });
    triggerHaptic('medium');
    logEvent('item_marked_done');
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await localStorageRepository.removeItem(id);
    setList(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== id) } : null);
    triggerHaptic('light');
    logEvent('item_removed');
  }, []);

  const clearDone = useCallback(async () => {
    if (!window.confirm('Удалить все купленные товары?')) return;
    await localStorageRepository.clearDone();
    setList(prev => prev ? { ...prev, items: prev.items.filter(i => !i.isDone) } : null);
    triggerHaptic('heavy');
    logEvent('list_cleared');
  }, []);

  return { list, isLoading, addItem, toggleItem, removeItem, clearDone };
};