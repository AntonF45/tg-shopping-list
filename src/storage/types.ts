import { ShoppingList, ShoppingItem, AddItemInput, ShoppingListsStore } from '../types/shopping';

export interface ListStorage {
  getAllLists(): Promise<ShoppingListsStore>;
  saveAllLists(store: ShoppingListsStore): Promise<void>;
  setActiveListId(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ShoppingListRepository {
  getAllLists(): Promise<ShoppingListsStore>;
  getActiveList(): Promise<ShoppingList>;
  setActiveList(id: string): Promise<void>;
  createList(title: string): Promise<ShoppingList>;
  deleteList(id: string): Promise<void>;
  renameList(id: string, newTitle: string): Promise<void>;
  addItem(input: AddItemInput): Promise<AddItemResult>;
  toggleItem(id: string): Promise<ShoppingItem>;
  removeItem(id: string): Promise<void>;
  clearDone(): Promise<void>;
  updateQty(id: string, qty: string): Promise<ShoppingItem>;
  getRecentItems(): Promise<string[]>;
  addRecentItem(name: string): Promise<void>;
}