export type Category = 'groceries' | 'household' | 'pharmacy' | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  qty?: string;
  category?: Category;
  isDone: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  items: ShoppingItem[];
  updatedAt: number;
}

// НОВЫЙ ТИП: хранилище всех списков
export interface ShoppingListsStore {
  version: number;
  activeListId: string;
  lists: ShoppingList[];
}

export interface AddItemInput {
  name: string;
  qty?: string;
  category?: Category;
}

export interface AddItemResult {
  item: ShoppingItem;
  wasDuplicate: boolean;
}