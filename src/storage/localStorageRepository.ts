import { ShoppingList, ShoppingItem, AddItemInput, ShoppingListsStore } from '../types/shopping';
import { ShoppingListRepository, ListStorage } from './types';

const STORAGE_KEY = 'shopping_lists_v2';
const SCHEMA_VERSION = 2;

const createEmptyList = (title: string = 'Покупки'): ShoppingList => ({
  id: crypto.randomUUID(),
  title,
  items: [],
  updatedAt: Math.floor(Date.now() / 1000),
});

const createEmptyStore = (): ShoppingListsStore => {
  const defaultList = createEmptyList('Покупки');
  return {
    version: SCHEMA_VERSION,
    activeListId: defaultList.id,
    lists: [defaultList],
  };
};

const storageAdapter: ListStorage = {
  async getAllLists(): Promise<ShoppingListsStore> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyStore();
      
      const parsed: ShoppingListsStore = JSON.parse(raw);
      if (parsed.version === SCHEMA_VERSION && parsed.lists?.length > 0) {
        return parsed;
      }
      console.warn('Устаревшая схема, создаём новое хранилище');
      return createEmptyStore();
    } catch (error) {
      console.error('Ошибка чтения localStorage:', error);
      return createEmptyStore();
    }
  },

  async saveAllLists(store: ShoppingListsStore): Promise<void> {
    try {
      const data = { ...store, version: SCHEMA_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  },

  async setActiveListId(id: string): Promise<void> {
    const store = await this.getAllLists();
    store.activeListId = id;
    await this.saveAllLists(store);
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const localStorageRepository: ShoppingListRepository = {
  async getAllLists(): Promise<ShoppingListsStore> {
    return storageAdapter.getAllLists();
  },

  async getActiveList(): Promise<ShoppingList> {
    const store = await storageAdapter.getAllLists();
    const activeList = store.lists.find(l => l.id === store.activeListId);
    return activeList || store.lists[0] || createEmptyList();
  },

  async setActiveList(id: string): Promise<void> {
    await storageAdapter.setActiveListId(id);
  },

  async createList(title: string): Promise<ShoppingList> {
    const store = await storageAdapter.getAllLists();
    const newList = createEmptyList(title);
    store.lists.push(newList);
    store.activeListId = newList.id;
    await storageAdapter.saveAllLists(store);
    return newList;
  },

  async deleteList(id: string): Promise<void> {
    const store = await storageAdapter.getAllLists();
    if (store.lists.length <= 1) {
      throw new Error('Нельзя удалить последний список');
    }
    store.lists = store.lists.filter(l => l.id !== id);
    if (store.activeListId === id) {
      store.activeListId = store.lists[0].id;
    }
    await storageAdapter.saveAllLists(store);
  },

  async renameList(id: string, newTitle: string): Promise<void> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === id);
    if (list) {
      list.title = newTitle;
      list.updatedAt = Math.floor(Date.now() / 1000);
      await storageAdapter.saveAllLists(store);
    }
  },

  async addItem(input: AddItemInput): Promise<ShoppingItem> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === store.activeListId);
    if (!list) throw new Error('Active list not found');
    
    const now = Math.floor(Date.now() / 1000);
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      qty: input.qty?.trim(),
      category: input.category || 'other',
      isDone: false,
      createdAt: now,
      updatedAt: now,
    };
    
    list.items.push(newItem);
    list.updatedAt = now;
    await storageAdapter.saveAllLists(store);
    return newItem;
  },

  async toggleItem(id: string): Promise<ShoppingItem> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === store.activeListId);
    if (!list) throw new Error('Active list not found');
    
    const item = list.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    
    item.isDone = !item.isDone;
    item.updatedAt = Math.floor(Date.now() / 1000);
    list.updatedAt = item.updatedAt;
    
    await storageAdapter.saveAllLists(store);
    return item;
  },

  async removeItem(id: string): Promise<void> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === store.activeListId);
    if (!list) return;
    
    list.items = list.items.filter(i => i.id !== id);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveAllLists(store);
  },

  async clearDone(): Promise<void> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === store.activeListId);
    if (!list) return;
    
    list.items = list.items.filter(i => !i.isDone);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveAllLists(store);
  },

  async updateQty(id: string, qty: string): Promise<ShoppingItem> {
    const store = await storageAdapter.getAllLists();
    const list = store.lists.find(l => l.id === store.activeListId);
    if (!list) throw new Error('Active list not found');
    
    const item = list.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    
    item.qty = qty;
    item.updatedAt = Math.floor(Date.now() / 1000);
    list.updatedAt = item.updatedAt;
    
    await storageAdapter.saveAllLists(store);
    return item;
  }
};