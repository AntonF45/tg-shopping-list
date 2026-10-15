declare global {
  interface Window {
    Telegram?: any;
  }
}

const MOSS_LIGHT = '#F5F3EC';
const MOSS_DARK = '#16261D';

console.log('[TG] SDK загружен до main.tsx:', Boolean(window.Telegram?.WebApp));

let lastAppliedTheme: 'light' | 'dark' | null = null;
let isInitialized = false;

const applyTheme = (source: string) => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const currentScheme = (tg.colorScheme ?? 'light') as 'light' | 'dark';
  console.log(`[TG] applyTheme (${source}): colorScheme = ${currentScheme}`);

  if (lastAppliedTheme === currentScheme) return;
  lastAppliedTheme = currentScheme;

  const isDark = currentScheme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const headerColor = isDark ? MOSS_DARK : MOSS_LIGHT;

  try {
    tg.setHeaderColor(headerColor);
    tg.setBackgroundColor(headerColor);
  } catch {
    // Fallback для старых версий Bot API / клиентов без HEX-поддержки
    console.warn('[TG] HEX не поддержан, fallback на bg_color');
    tg.setHeaderColor?.('bg_color');
    tg.setBackgroundColor?.('bg_color');
  }
};

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('[TG] WebApp не найден: запуск вне Telegram');
    document.documentElement.setAttribute('data-theme', 'light');
    return;
  }

  if (isInitialized) {
    console.log('[TG] initTelegram вызван повторно — пропуск (StrictMode-safe)');
    return;
  }
  isInitialized = true;
  console.log('[TG] initTelegram вызван');

  tg.ready();
  tg.expand();
  applyTheme('init');

  tg.onEvent('themeChanged', () => {
    console.log('[TG] СОБЫТИЕ themeChanged сработало');
    applyTheme('themeChanged');
  });

  // Страховка: проверка темы при возврате в приложение
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      applyTheme('visibilitychange');
    }
  });
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};