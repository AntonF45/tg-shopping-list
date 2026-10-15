declare global {
  interface Window {
    Telegram: any;
  }
}

// Mossforge цвета для шапки
const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isDark = tg.colorScheme === 'dark';
  
  // 1. Устанавливаем атрибут data-theme на <html> — это ключ к работе CSS
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // 2. Красим системную шапку Telegram в цвет нашего приложения
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
  
  // Слушаем переключение темы пользователем
  tg.onEvent('themeChanged', () => {
    applyTheme();
  });
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};