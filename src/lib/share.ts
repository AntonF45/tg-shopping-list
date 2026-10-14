import { ShoppingItem } from '../types/shopping';
import { logEvent } from './analytics';

export const shareList = async (items: ShoppingItem[]) => {
  if (items.length === 0) return;

  const text = items
    .map(item => {
      const prefix = item.isDone ? '✅' : '☐';
      const qtyStr = item.qty ? `, ${item.qty}` : '';
      return `${prefix} ${item.name}${qtyStr}`;
    })
    .join('\n');

  try {
    if (navigator.share) {
      await navigator.share({ text });
      logEvent('list_shared', { sharedMethod: 'native', totalItems: items.length });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Список скопирован в буфер обмена');
      logEvent('list_shared', { sharedMethod: 'clipboard', totalItems: items.length });
    }
  } catch (err) {
    console.error('Ошибка шаринга:', err);
  }
};