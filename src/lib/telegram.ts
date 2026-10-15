declare global {
  interface Window {
    Telegram: any;
  }
}

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    // 1. Сообщаем Telegram, что приложение готово
    tg.ready();
    
    // 2. Разворачиваем на весь экран
    tg.expand();
    
    // 3. Настраиваем цвета в стиле Mossforge
    const mossLight = '#F5F3EC'; // Кремовый
    const mossDark = '#1A2F23';  // Тёмно-зелёный
    
    const isDark = tg.colorScheme === 'dark';
    const headerColor = isDark ? mossDark : mossLight;
    
    // Устанавливаем цвет шапки и фона приложения
    tg.setHeaderColor(headerColor);
    tg.setBackgroundColor(headerColor);
    
    // 4. Слушаем изменение темы в Telegram (если пользователь переключит её в настройках)
    tg.onEvent('themeChanged', () => {
      const newIsDark = tg.colorScheme === 'dark';
      const newHeaderColor = newIsDark ? mossDark : mossLight;
      tg.setHeaderColor(newHeaderColor);
      tg.setBackgroundColor(newHeaderColor);
    });
  }
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};