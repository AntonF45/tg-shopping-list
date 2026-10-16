import {
  ShoppingList,
  ShoppingItem,
  AddItemInput,
  AddItemResult,
} from '../types/shopping';
import {
  ShoppingListRepository,
  ListStorage,
  ShoppingListsStore,
} from './types';

const STORAGE_KEY = 'shopping_lists_v2';
const RECENT_KEY = 'recent_items_v1';
const SCHEMA_VERSION = 2;
const MAX_RECENT = 50;

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
  async getList(): Promise<ShoppingList> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyList();
      const parsed: ShoppingListsStore = JSON.parse(raw);
      if (parsed.version === SCHEMA_VERSION && parsed.lists?.length > 0) {
        return (
          parsed.lists.find((l: ShoppingList) => l.id === parsed.activeListId) ||
          parsed.lists[0]
        );
      }
      return createEmptyList();
    } catch {
      return createEmptyList();
    }
  },

  async saveList(list: ShoppingList): Promise<void> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const store: ShoppingListsStore = raw
        ? JSON.parse(raw)
        : createEmptyStore();
      const idx = store.lists.findIndex((l: ShoppingList) => l.id === list.id);
      if (idx >= 0) store.lists[idx] = list;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// === Recent items helpers ===
const getRecentFromStorage = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentToStorage = (items: string[]): void => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items));
};

export const localStorageRepository: ShoppingListRepository = {
  async getList(): Promise<ShoppingList> {
    return storageAdapter.getList();
  },

  async getRecentItems(): Promise<string[]> {
    return getRecentFromStorage();
  },

  async addRecentItem(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;
    const items = getRecentFromStorage();
    const filtered = items.filter(
      (i: string) => i.toLowerCase() !== trimmed.toLowerCase()
    );
    filtered.unshift(trimmed);
    saveRecentToStorage(filtered.slice(0, MAX_RECENT));
  },

  async addItem(input: AddItemInput): Promise<AddItemResult> {
    const list = await storageAdapter.getList();
    const now = Math.floor(Date.now() / 1000);
    const normalizedName = input.name.toLowerCase().trim();

    const existing = list.items.find(
      (i: ShoppingItem) => i.name.toLowerCase().trim() === normalizedName
    );

    if (existing) {
      const currentQty = parseInt(existing.qty || '0') || 0;
      existing.qty = (currentQty + 1).toString();
      existing.updatedAt = now;
      list.updatedAt = now;
      await storageAdapter.saveList(list);
      return { item: existing, wasDuplicate: true };
    }

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
    return { item: newItem, wasDuplicate: false };
  },

  async toggleItem(id: string): Promise<ShoppingItem> {
    const list = await storageAdapter.getList();
    const item = list.items.find((i: ShoppingItem) => i.id === id);
    if (!item) throw new Error('Item not found');
    item.isDone = !item.isDone;
    item.updatedAt = Math.floor(Date.now() / 1000);
    list.updatedAt = item.updatedAt;
    await storageAdapter.saveList(list);
    return item;
  },

  async removeItem(id: string): Promise<void> {
    const list = await storageAdapter.getList();
    list.items = list.items.filter((i: ShoppingItem) => i.id !== id);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveList(list);
  },

  async clearDone(): Promise<void> {
    const list = await storageAdapter.getList();
    list.items = list.items.filter((i: ShoppingItem) => !i.isDone);
    list.updatedAt = Math.floor(Date.now() / 1000);
    await storageAdapter.saveList(list);
  },

  async updateQty(id: string, qty: string): Promise<ShoppingItem> {
    const list = await storageAdapter.getList();
    const item = list.items.find((i: ShoppingItem) => i.id === id);
    if (!item) throw new Error('Item not found');
    item.qty = qty;
    item.updatedAt = Math.floor(Date.now() / 1000);
    list.updatedAt = item.updatedAt;
    await storageAdapter.saveList(list);
    return item;
  },

  async getAllLists(): Promise<ShoppingListsStore> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyStore();
      const parsed: ShoppingListsStore = JSON.parse(raw);
      if (parsed.version === SCHEMA_VERSION && parsed.lists?.length > 0) {
        return parsed;
      }
      return createEmptyStore();
    } catch {
      return createEmptyStore();
    }
  },

  async getActiveList(): Promise<ShoppingList> {
    const store = await this.getAllLists();
    return (
      store.lists.find((l: ShoppingList) => l.id === store.activeListId) ||
      store.lists[0] ||
      createEmptyList()
    );
  },

  async setActiveList(id: string): Promise<void> {
    const store = await this.getAllLists();
    store.activeListId = id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },

  async createList(title: string): Promise<ShoppingList> {
    const store = await this.getAllLists();
    const newList = createEmptyList(title);
    store.lists.push(newList);
    store.activeListId = newList.id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return newList;
  },

  async deleteList(id: string): Promise<void> {
    const store = await this.getAllLists();
    if (store.lists.length <= 1)
      throw new Error('Нельзя удалить последний список');
    store.lists = store.lists.filter((l: ShoppingList) => l.id !== id);
    if (store.activeListId === id) store.activeListId = store.lists[0].id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },

  async renameList(id: string, newTitle: string): Promise<void> {
    const store = await this.getAllLists();
    const list = store.lists.find((l: ShoppingList) => l.id === id);
    if (list) {
      list.title = newTitle;
      list.updatedAt = Math.floor(Date.now() / 1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  },
};