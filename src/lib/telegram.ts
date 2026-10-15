declare global {
  interface Window {
    Telegram?: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

let lastAppliedTheme: 'light' | 'dark' | null = null;

const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const currentScheme = tg.colorScheme as 'light' | 'dark';
  
  if (lastAppliedTheme === currentScheme) {
    return;
  }
  lastAppliedTheme = currentScheme;

  const isDark = currentScheme === 'dark';
  console.log(`[Telegram Theme] Применяем тему: ${isDark ? 'dark' : 'light'}`);

  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const headerColor = isDark ? MOSS_DARK : MOSS_LIGHT;

  try {
    tg.setHeaderColor(headerColor);
    tg.setBackgroundColor(headerColor);
  } catch (error) {
    console.warn('[Telegram Theme] Fallback на bg_color', error);
    tg.setHeaderColor('bg_color');
    tg.setBackgroundColor('bg_color');
  }
};

let isInitialized = false;

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    document.documentElement.setAttribute('data-theme', 'light');
    return;
  }

  if (isInitialized) return;
  isInitialized = true;

  tg.ready();
  tg.expand();

  applyTheme();

  tg.onEvent('themeChanged', () => {
    console.log('[Telegram] themeChanged сработал');
    applyTheme();
  });

  tg.onEvent('viewportChanged', () => {
    console.log('[Telegram] viewportChanged сработал');
    applyTheme();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Telegram] visibilitychange сработал');
      applyTheme();
    }
  });

    // Отслеживаем появление клавиатуры и поднимаем кнопки
  const floatingActions = document.querySelector('.floating-actions');
  if (floatingActions && tg) {
    tg.onEvent('viewportChanged', (e: any) => {
      if (e.isStateStable) {
        const heightDiff = tg.viewportHeight - window.innerHeight;
        if (heightDiff > 100) {
          // Клавиатура открыта
          (floatingActions as HTMLElement).style.bottom = '20px';
        } else {
          // Клавиатура закрыта
          (floatingActions as HTMLElement).style.bottom = '20px';
        }
      }
    });
  }
  
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};