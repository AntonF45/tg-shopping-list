import { ShoppingItem } from '../types/shopping';

interface ShareOptions {
  listTitle?: string;
  includeDone?: boolean;
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
  lines.push(`🛒 Список покупок: ${listTitle}`);
  lines.push('');

  itemsToShare.forEach(item => {
    const qty = item.qty ? ` × ${item.qty}` : '';
    const doneMark = item.isDone ? ' ✓' : '';
    lines.push(`— ${item.name}${qty}${doneMark}`);
  });

  const doneCount = items.filter(i => i.isDone).length;
  const totalCount = items.length;

  lines.push('');
  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Итого: ${totalCount} позиций${doneCount > 0 ? `, ${doneCount} куплено` : ''}`);

  const text = lines.join('\n');

  // Способ 1: Нативный share API (мобильные устройства)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Список покупок: ${listTitle}`,
        text: text,
      });
      return;
    } catch (err) {
      // Пользователь отменил share или ошибка — продолжаем к fallback
      if ((err as Error).name === 'AbortError') {
        return; // Пользователь отменил — ничего не делаем
      }
      console.warn('navigator.share failed:', err);
    }
  }

  // Способ 2: Telegram WebApp openTelegramLink (десктоп)
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    try {
      // Открываем диалог share с предзаполненным текстом
      const encodedText = encodeURIComponent(text);
      tg.openTelegramLink(`https://t.me/share/url?url=&text=${encodedText}`);
      return;
    } catch (err) {
      console.warn('openTelegramLink failed:', err);
    }
  }

  // Способ 3: Копирование в буфер обмена
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