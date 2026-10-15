declare global {
  interface Window {
    Telegram: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

// Главная функция применения темы
export const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isDark = tg.colorScheme === 'dark';
  
  // 1. Обновляем атрибут data-theme для CSS (это переключает цвета)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // 2. Обновляем цвет системной шапки Telegram
  const headerColor = isDark ? MOSS_DARK : MOSS_LIGHT;
  tg.setHeaderColor(headerColor);
  tg.setBackgroundColor(headerColor);
};

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();
  
  // Применяем тему при запуске
  applyTheme();
  
  // Подписываемся на событие смены темы в Telegram
  tg.onEvent('themeChanged', applyTheme);
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};