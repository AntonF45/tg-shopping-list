import { ShoppingList, ShoppingItem, AddItemInput } from '../types/shopping';
import { ShoppingListRepository, ListStorage } from './types';

const STORAGE_KEY = 'shopping_list_v1';
const SCHEMA_VERSION = 1;

interface StoredData {
  version: number;
  list: ShoppingList;
}

const createEmptyList = (): ShoppingList => ({
  id: crypto.randomUUID(),
  title: 'Покупки',
  items: [],
  updatedAt: Math.floor(Date.now() / 1000),
});

const storageAdapter: ListStorage = {
  async getList(): Promise<ShoppingList> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyList();
      
      const parsed: StoredData = JSON.parse(raw);
      if (parsed.version === SCHEMA_VERSION && parsed.list) {
        return parsed.list;
      }
      console.warn('Устаревшая или повреждённая схема, создаём новый список');
      return createEmptyList();
    } catch (error) {
      console.error('Ошибка чтения localStorage:', error);
      return createEmptyList();
    }
  },

  async saveList(list: ShoppingList): Promise<void> {
    try {
      const data: StoredData = { version: SCHEMA_VERSION, list };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const localStorageRepository: ShoppingListRepository = {
  async getList(): Promise<ShoppingList> {
    return storageAdapter.getList();
  },

  async addItem(input: AddItemInput): Promise<ShoppingItem> {
    const list = await storageAdapter.getList();
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
    await storageAdapter.saveList(list);
    return newItem;
  },

  async toggleItem(id: string): Promise<ShoppingItem> {
    const list = await storageAdapter.getList();
    const item = list.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    
    item.isDone = !item.isDone;
    item.updatedAt = Math.floor(Date.now() / 1000);
    list.updatedAt = item.updatedAt;
    
    // Сортировка: активные сверху, купленные снизу
    list.items.sort((a, b) => {
      if (a.isDone === b.isDone) return b.createdAt - a.createdAt;
      return a.isDone ? 1 : -1;
    });
    
    await storageAdapter.saveList(list);
    return item;
  },

  async removeItem(id: string): Promise<void> {
    const list = await storageAdapter.getList();
    list.items = list.items.filter(i => i.id !== id);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveList(list);
  },

  async clearDone(): Promise<void> {
    const list = await storageAdapter.getList();
    list.items = list.items.filter(i => !i.isDone);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveList(list);
  }
};