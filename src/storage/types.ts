import { ShoppingList, ShoppingItem, AddItemInput } from '../types/shopping';

export interface ListStorage {
  getList(): Promise<ShoppingList>;
  saveList(list: ShoppingList): Promise<void>;
  clear(): Promise<void>;
}

export interface ShoppingListRepository {
  getList(): Promise<ShoppingList>;
  addItem(input: AddItemInput): Promise<ShoppingItem>;
  toggleItem(id: string): Promise<ShoppingItem>;
  removeItem(id: string): Promise<void>;
  clearDone(): Promise<void>;
  updateQty(id: string, qty: string): Promise<ShoppingItem>; // ← ВОТ ЭТА СТРОКА БЫЛА ПРОПУЩЕНА
}