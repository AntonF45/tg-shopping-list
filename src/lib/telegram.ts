   declare global {
     interface Window {
       Telegram: any;
     }
   }

export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Настройка цветов хедера под тему
    tg.setHeaderColor(tg.colorScheme === 'dark' ? '#1c1c1e' : '#ffffff');
    tg.setBackgroundColor(tg.colorScheme === 'dark' ? '#1c1c1e' : '#ffffff');
  }
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
};