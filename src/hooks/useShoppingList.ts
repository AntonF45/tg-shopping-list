import { useState, useEffect, useCallback } from 'react';
import { ShoppingList, AddItemInput } from '../types/shopping';
import { localStorageRepository } from '../storage/localStorageRepository';
import { logEvent, getInitialListLength } from '../lib/analytics';
import { triggerHaptic } from '../lib/telegram';

export const useShoppingList = () => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [allLists, setAllLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const store = await localStorageRepository.getAllLists();
      const activeList = await localStorageRepository.getActiveList();
      const recent = await localStorageRepository.getRecentItems();

      setAllLists(store.lists);
      setActiveListId(store.activeListId);
      setList(activeList);
      setRecentItems(recent);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = useCallback(
    async (input: AddItemInput) => {
      if (!input.name.trim()) {
        return { item: null, wasDuplicate: false };
      }

      const result = await localStorageRepository.addItem(input);

      // Добавляем в историю (поднимаем наверх, даже если дубликат)
      await localStorageRepository.addRecentItem(input.name);
      const updatedRecent = await localStorageRepository.getRecentItems();
      setRecentItems(updatedRecent);

      // Обновляем список в стейте
      setList(prev => {
        if (!prev) return null;

        // Если дубликат — просто обновляем существующий элемент
        if (result.wasDuplicate) {
          return {
            ...prev,
            items: prev.items.map(i =>
              i.id === result.item.id ? result.item : i
            ),
          };
        }

        // Новый товар — добавляем в конец (если ещё не в списке)
        const exists = prev.items.find(i => i.id === result.item.id);
        if (exists) return prev;

        return {
          ...prev,
          items: [...prev.items, result.item],
        };
      });

      // Вибрация: средняя для дубликата, лёгкая для нового
      triggerHaptic(result.wasDuplicate ? 'medium' : 'light');

      logEvent(
        result.wasDuplicate ? 'item_duplicate_increased' : 'item_added',
        {
          hasQty: !!input.qty,
          totalItems: list?.items.length || 0,
        }
      );

      return result;
    },
    [list?.items.length]
  );

  const toggleItem = useCallback(
    async (id: string) => {
      const updatedItem = await localStorageRepository.toggleItem(id);
      setList(prev => {
        if (!prev) return null;
        const newItems = prev.items.map(i =>
          i.id === id ? updatedItem : i
        );
        return { ...prev, items: newItems };
      });
      setAllLists(prev =>
        prev.map(l =>
          l.id === activeListId
            ? {
                ...l,
                items: l.items.map(i =>
                  i.id === id ? updatedItem : i
                ),
              }
            : l
        )
      );
      triggerHaptic('medium');
      logEvent('item_marked_done');
    },
    [activeListId]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await localStorageRepository.removeItem(id);
      setList(prev =>
        prev
          ? { ...prev, items: prev.items.filter(i => i.id !== id) }
          : null
      );
      setAllLists(prev =>
        prev.map(l =>
          l.id === activeListId
            ? { ...l, items: l.items.filter(i => i.id !== id) }
            : l
        )
      );
      triggerHaptic('light');
      logEvent('item_removed');
    },
    [activeListId]
  );

  const clearDone = useCallback(async () => {
    const tg = window.Telegram?.WebApp;
    const confirmDelete = () =>
      new Promise<boolean>(resolve => {
        if (tg?.showConfirm) {
          tg.showConfirm('Удалить все купленные товары?', (ok: boolean) =>
            resolve(ok)
          );
        } else {
          resolve(window.confirm('Удалить все купленные товары?'));
        }
      });

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    await localStorageRepository.clearDone();
    setList(prev =>
      prev ? { ...prev, items: prev.items.filter(i => !i.isDone) } : null
    );
    setAllLists(prev =>
      prev.map(l =>
        l.id === activeListId
          ? { ...l, items: l.items.filter(i => !i.isDone) }
          : l
      )
    );
    triggerHaptic('heavy');
    logEvent('list_cleared');
  }, [activeListId]);

  const setActiveList = useCallback(
    async (id: string) => {
      await localStorageRepository.setActiveList(id);
      const store = await localStorageRepository.getAllLists();
      const newList = store.lists.find(l => l.id === id);
      if (newList) {
        setList(newList);
        setActiveListId(id);
        triggerHaptic('light');
      }
    },
    []
  );

  const createList = useCallback(async (title: string) => {
    const newList = await localStorageRepository.createList(title);
    const store = await localStorageRepository.getAllLists();
    setAllLists(store.lists);
    setList(newList);
    setActiveListId(newList.id);
    logEvent('list_created');
  }, []);

  const renameList = useCallback(
    async (id: string, newTitle: string) => {
      await localStorageRepository.renameList(id, newTitle);
      const store = await localStorageRepository.getAllLists();
      setAllLists(store.lists);
      if (id === activeListId) {
        const updated = store.lists.find(l => l.id === id);
        if (updated) setList(updated);
      }
      triggerHaptic('light');
    },
    [activeListId]
  );

  const deleteList = useCallback(async (id: string) => {
    await localStorageRepository.deleteList(id);
    const store = await localStorageRepository.getAllLists();
    setAllLists(store.lists);
    const newList = store.lists.find(l => l.id === store.activeListId);
    if (newList) {
      setList(newList);
      setActiveListId(store.activeListId);
    }
    triggerHaptic('medium');
  }, []);

  return {
    list,
    allLists,
    activeListId,
    recentItems,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    clearDone,
    setActiveList,
    createList,
    renameList,
    deleteList,
  };
};