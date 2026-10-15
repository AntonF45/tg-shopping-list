import { useState, useEffect } from 'react';

export const useTelegramTheme = () => {
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // 1. Слушаем событие смены темы от Telegram
    const handleThemeChange = () => {
      setThemeVersion(v => v + 1);
    };

    tg.onEvent('themeChanged', handleThemeChange);

    // 2. Дополнительная проверка при возврате в приложение
    // (на случай, если Telegram не отправил событие)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setThemeVersion(v => v + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      tg.offEvent('themeChanged', handleThemeChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return themeVersion;
};