declare global {
  interface Window {
    Telegram?: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

export const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isDark = tg.colorScheme === 'dark';

  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light'
  );

  const headerColor = isDark ? MOSS_DARK : MOSS_LIGHT;

  try {
    tg.setHeaderColor(headerColor);
    tg.setBackgroundColor(headerColor);
  } catch {
    // Старые версии Telegram Mini Apps могут не поддерживать HEX
    tg.setHeaderColor?.('bg_color');
    tg.setBackgroundColor?.('bg_color');
  }
};

let initialized = false;

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;

  if (!tg || initialized) return;
  initialized = true;

  tg.ready();
  tg.expand();

  applyTheme();

  tg.onEvent('themeChanged', () => {
    // Важно: читаем colorScheme заново внутри события
    applyTheme();
  });
};

export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' = 'light'
) => {
  const tg = window.Telegram?.WebApp;

  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};