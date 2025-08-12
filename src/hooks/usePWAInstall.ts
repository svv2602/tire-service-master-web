import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  showInstallPrompt: () => void;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // Определяем платформу
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // Проверяем, установлено ли приложение
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
    };

    // Слушаем событие установки приложения
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = useCallback(async () => {
    if (platform === 'ios') {
      // Для iOS показываем инструкции
      alert('Для установки на iOS:\n1. Нажмите кнопку "Поделиться" в Safari\n2. Выберите "На экран Домой"\n3. Нажмите "Добавить"');
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь принял установку PWA');
        } else {
          console.log('Пользователь отклонил установку PWA');
        }
      } catch (error) {
        console.error('Ошибка при установке PWA:', error);
      }
      setDeferredPrompt(null);
    } else {
      // Показываем инструкции для браузеров, которые не поддерживают beforeinstallprompt
      alert('Для установки приложения:\n1. Откройте меню браузера\n2. Выберите "Установить приложение" или "Добавить на главный экран"');
    }
  }, [deferredPrompt, platform]);

  return {
    isInstallable: !!deferredPrompt || platform === 'ios',
    isInstalled,
    platform,
    showInstallPrompt,
  };
};