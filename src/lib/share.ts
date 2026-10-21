import { ShoppingItem } from '../types/shopping';

const BOT_USERNAME = 'KupiShopList_bot';
interface ShareOptions {
  listTitle?: string;
  includeDone?: boolean;
}

const pluralize = (
  count: number,
  forms: [string, string, string]
): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (
    mod10 >= 2 &&
    mod10 <= 4 &&
    (mod100 < 10 || mod100 >= 20)
  ) {
    return forms[1];
  }

  return forms[2];
};

const formatQuantity = (
  qty: ShoppingItem['qty'],
  unit?: ShoppingItem['unit']
): string => {
  
  if (!qty) return '';

  if (!unit || unit === 'шт') {
    return ` — ${qty}`;
  }

  return ` — ${qty} ${unit}`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const buildListText = (
  items: ShoppingItem[],
  listTitle: string,
  includeDone: boolean
): string => {
  const activeItems = items.filter(item => !item.isDone);
  const doneItems = items.filter(item => item.isDone);

  const itemsToShare = includeDone ? items : activeItems;

  if (itemsToShare.length === 0) {
    return `🛒 ${listTitle}\n\nСписок пуст.`;
  }

  const lines: string[] = [];

  lines.push(`🛒 ${listTitle}`);
  lines.push(`📅 ${formatDate(new Date())}`);
  lines.push('');

  if (activeItems.length > 0) {
    lines.push('Нужно купить:');

    activeItems.forEach(item => {
      const quantity = formatQuantity(item.qty, item.unit);

      lines.push(`▫️ ${item.name}${quantity}`);
    });

    lines.push('');
  }

  if (includeDone && doneItems.length > 0) {
    lines.push('Уже куплено:');

    doneItems.forEach(item => {
      const quantity = formatQuantity(item.qty, item.unit);

      lines.push(`✅ ${item.name}${quantity}`);
    });

    lines.push('');
  }

  const total = itemsToShare.length;

  const totalWord = pluralize(total, [
    'позиция',
    'позиции',
    'позиций',
  ]);

  lines.push('— — — — — — — — — —');
  lines.push(`📦 Всего: ${total} ${totalWord}`);

  if (includeDone && doneItems.length > 0) {
    const doneWord = pluralize(doneItems.length, [
      'куплена',
      'куплено',
      'куплено',
    ]);

    lines.push(`✅ ${doneItems.length} ${doneWord}`);
  }

  lines.push(`https://t.me/${BOT_USERNAME}`);

  return lines.join('\n');
};

export const shareList = async (
  items: ShoppingItem[],
  options: ShareOptions = {}
) => {
  const {
    listTitle = 'Покупки',
    includeDone = true,
  } = options;

  const itemsToShare = includeDone
    ? items
    : items.filter(item => !item.isDone);

  const tg = window.Telegram?.WebApp;

  if (itemsToShare.length === 0) {
    const message = 'Список пуст';

    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }

    return;
  }

  const text = buildListText(
    items,
    listTitle,
    includeDone
  );

  // 1. Нативное меню «Поделиться»
  if (navigator.share) {
    try {
      await navigator.share({
        title: listTitle,
        text,
      });

      return;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }

      console.warn('navigator.share failed:', error);
    }
  }

  // 2. Шаринг через Telegram
  if (tg?.openTelegramLink) {
    try {
      const encodedText = encodeURIComponent(text);

      tg.openTelegramLink(
        `https://t.me/share/url?url=&text=${encodedText}`
      );

      return;
    } catch (error) {
      console.warn('openTelegramLink failed:', error);
    }
  }

  // 3. Копирование в буфер обмена
  try {
    await navigator.clipboard.writeText(text);

    const message = 'Список скопирован в буфер обмена';

    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }

    return;
  } catch (error) {
    console.warn('clipboard.writeText failed:', error);
  }

  // 4. Резервное копирование
  try {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    textarea.setAttribute('data-share-copy', 'true');

    document.body.appendChild(textarea);
    textarea.select();

    document.execCommand('copy');

    const message = 'Список скопирован в буфер обмена';

    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  } catch {
    const errorMessage = 'Не удалось скопировать список';

    if (tg?.showAlert) {
      tg.showAlert(errorMessage);
    } else {
      alert(errorMessage);
    }
  } finally {
    const textarea = document.querySelector(
      'textarea[data-share-copy="true"]'
    );

    if (textarea) {
      textarea.remove();
    }
  }
};