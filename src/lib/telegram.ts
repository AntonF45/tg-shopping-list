declare global {
  interface Window {
    Telegram?: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isDark = tg.colorScheme === 'dark';
  console.log(`[Telegram Theme] Применяем тему: ${isDark ? 'dark' : 'light'}`);

  // 1. Обновляем атрибут для CSS
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // 2. Красим шапку Telegram
  const headerColor = isDark ? MOSS_DARK : MOSS_LIGHT;

  try {
    tg.setHeaderColor(headerColor);
    tg.setBackgroundColor(headerColor);
    console.log(`[Telegram Theme] Установлен кастомный HEX цвет: ${headerColor}`);
  } catch (error) {
    // Фоллбэк для клиентов, которые не поддерживают кастомные HEX цвета
    console.warn('[Telegram Theme] Ошибка установки HEX, используем fallback "bg_color"', error);
    tg.setHeaderColor('bg_color');
    tg.setBackgroundColor('bg_color');
  }
};

let isInitialized = false;

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('[Telegram] WebApp не найден. Запуск вне Telegram?');
    // Для локальной разработки в браузере принудительно ставим светлую тему
    document.documentElement.setAttribute('data-theme', 'light');
    return;
  }

  if (isInitialized) {
    console.log('[Telegram] Уже инициализировано, пропускаем.');
    return;
  }
  
  isInitialized = true;
  console.log('[Telegram] Инициализация WebApp...');

  tg.ready();
  tg.expand();

  // Применяем тему при старте
  applyTheme();

  // Слушаем изменение темы внутри Telegram
  tg.onEvent('themeChanged', () => {
    console.log('[Telegram] Событие themeChanged сработало!');
    console.log('[Telegram] Новое значение colorScheme:', tg.colorScheme);
    applyTheme();
  });

  // Фоллбэк для Telegram Desktop, который может не слать themeChanged
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Telegram] Приложение стало видимым, принудительная проверка темы.');
      applyTheme();
    }
  });
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};