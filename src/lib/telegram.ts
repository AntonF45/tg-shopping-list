declare global {
  interface Window {
    Telegram: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isDark = tg.colorScheme === 'dark';
  
  // Устанавливаем атрибут data-theme на <html>
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // Красим системную шапку Telegram
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
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};