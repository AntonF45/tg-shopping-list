declare global {
  interface Window {
    Telegram?: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#1A2F23';

// Храним последнюю примененную тему, чтобы не делать лишнюю работу
let lastAppliedTheme: 'light' | 'dark' | null = null;

const applyTheme = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  // Приводим к нужному типу
  const currentScheme = tg.colorScheme as 'light' | 'dark';
  
  // ГЛАВНАЯ ОПТИМИЗАЦИЯ: Если тема не менялась, выходим сразу
  if (lastAppliedTheme === currentScheme) {
    return; 
  }
  lastAppliedTheme = currentScheme;

  const isDark = currentScheme === 'dark';
  console.log(`[Telegram Theme] Применяем тему: ${isDark ? 'dark' : 'light'}`);

  // 1. Обновляем атрибут для CSS
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // 2. Красим шапку Telegram
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

  // 1. Применяем тему при старте
  applyTheme();

  // 2. Стандартное событие (работает на Android и Desktop)
  tg.onEvent('themeChanged', () => {
    console.log('[Telegram] themeChanged сработал');
    applyTheme();
  });

  // 3. Фоллбэк для iOS: срабатывает, когда закрываются настройки Telegram
  tg.onEvent('viewportChanged', () => {
    console.log('[Telegram] viewportChanged сработал (проверка темы)');
    applyTheme();
  });

  // 4. Фоллбэк для DOM (сворачивание/разворачивание)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Telegram] visibilitychange сработал');
      applyTheme();
    }
  });

  // 5. "ЯДЕРНЫЙ" Фоллбэк для iOS: проверка при первом касании
  // Благодаря проверке lastAppliedTheme, это не влияет на производительность
  const checkOnInteraction = () => {
    console.log('[Telegram] Взаимодействие пользователя, синхронизация темы');
    applyTheme();
  };
  
  document.addEventListener('click', checkOnInteraction);
  document.addEventListener('touchstart', checkOnInteraction);
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};