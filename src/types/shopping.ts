export type Category = 'groceries' | 'household' | 'pharmacy' | 'other';
export type Unit = 'шт' | 'кг' | 'г' | 'л' | 'мл' | 'уп' | 'пач' | '';

export interface ShoppingItem {
  id: string;
  name: string;
  qty?: string;
  unit?: Unit;
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

export interface ShoppingListsStore {
  version: number;
  activeListId: string;
  lists: ShoppingList[];
}

export interface AddItemInput {
  name: string;
  qty?: string;
  unit?: Unit;
  category?: Category;
}

export interface AddItemResult {
  item: ShoppingItem;
  wasDuplicate: boolean;
}