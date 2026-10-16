import { ShoppingItem } from '../types/shopping';

interface ShareOptions {
  listTitle?: string;
  includeDone?: boolean; // Включать ли купленные товары (по умолчанию да)
}

export const shareList = async (
  items: ShoppingItem[],
  options: ShareOptions = {}
) => {
  const { listTitle = 'Покупки', includeDone = true } = options;

  const itemsToShare = includeDone
    ? items
    : items.filter(i => !i.isDone);

  if (itemsToShare.length === 0) {
    // Если нет товаров для отправки — показываем уведомление
    const tg = window.Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert('Список пуст');
    } else {
      alert('Список пуст');
    }
    return;
  }

  // Формируем текст сообщения
  const lines: string[] = [];

  // Заголовок
  lines.push(`🛒 Список покупок: ${listTitle}`);
  lines.push('');

  // Товары
  itemsToShare.forEach(item => {
    const qty = item.qty ? ` × ${item.qty}` : '';
    const doneMark = item.isDone ? ' ✓' : '';
    lines.push(`— ${item.name}${qty}${doneMark}`);
  });

  // Разделитель и статистика
  const doneCount = items.filter(i => i.isDone).length;
  const totalCount = items.length;

  lines.push('');
  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Итого: ${totalCount} позиций${doneCount > 0 ? `, ${doneCount} куплено` : ''}`);

  const text = lines.join('\n');

  // Отправка через Telegram WebApp
  const tg = window.Telegram?.WebApp;

  if (tg?.switchInlineQuery) {
    // Отправка в выбранный чат (inline mode)
    try {
      tg.switchInlineQuery(text, ['users', 'groups', 'channels']);
      return;
    } catch {
      // Fallback
    }
  }

  // Fallback: копирование в буфер обмена
  try {
    await navigator.clipboard.writeText(text);
    if (tg?.showAlert) {
      tg.showAlert('Список скопирован в буфер обмена');
    } else {
      alert('Список скопирован в буфер обмена');
    }
  } catch {
    // Последний fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('Список скопирован в буфер обмена');
    } catch {
      alert('Не удалось скопировать список');
    }
    document.body.removeChild(textarea);
  }
};