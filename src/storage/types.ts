import { 
  ShoppingList, 
  ShoppingItem, 
  AddItemInput, 
  AddItemResult,  
} from '../types/shopping';

export interface ListStorage {
  getList(): Promise<ShoppingList>;
  saveList(list: ShoppingList): Promise<void>;
  clear(): Promise<void>;
}

export interface ShoppingListsStore {
  version: number;
  activeListId: string;
  lists: ShoppingList[];
}

export interface ShoppingListRepository {
  getList(): Promise<ShoppingList>;
  getRecentItems(): Promise<string[]>;
  addRecentItem(name: string): Promise<void>;
  removeRecentItem(name: string): Promise<void>;
  addItem(input: AddItemInput): Promise<AddItemResult>;
  toggleItem(id: string): Promise<ShoppingItem>;
  removeItem(id: string): Promise<void>;
  clearDone(): Promise<void>;
  updateQty(id: string, qty: string): Promise<ShoppingItem>;
  getAllLists(): Promise<ShoppingListsStore>;
  getActiveList(): Promise<ShoppingList>;
  setActiveList(id: string): Promise<void>;
  createList(title: string): Promise<ShoppingList>;
  deleteList(id: string): Promise<void>;
  renameList(id: string, newTitle: string): Promise<void>;
}