import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Smartphone as MobileIcon,
  Computer as DesktopIcon,
  Apple as AppleIcon,
  Android as AndroidIcon,
  NotificationsActive as NotificationIcon,
  CloudOff as OfflineIcon,
  Speed as SpeedIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
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
      console.log('[PWA] beforeinstallprompt event fired!', e);
      e.preventDefault();
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
      
      // Показываем диалог только если приложение не установлено
      if (!isStandalone) {
        console.log('[PWA] Showing install dialog');
        setShowDialog(true);
      }
    };

    // Слушаем событие установки приложения
    const handleAppInstalled = () => {
      console.log('[PWA] App installed!');
      setIsInstalled(true);
      setShowDialog(false);
      setDeferredPrompt(null);
      if (onInstall) {
        onInstall();
      }
    };

    // Для iOS показываем диалог через некоторое время, если нет beforeinstallprompt
    let iOSTimeout: NodeJS.Timeout;
    if (/iphone|ipad|ipod/.test(userAgent) && !isStandalone) {
      console.log('[PWA] iOS detected, will show install instructions after delay');
      iOSTimeout = setTimeout(() => {
        if (!deferredPrompt && !isStandalone) {
          console.log('[PWA] Showing iOS install instructions');
          setShowDialog(true);
        }
      }, 5000); // Показываем через 5 секунд для iOS
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iOSTimeout) {
        clearTimeout(iOSTimeout);
      }
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowDialog(false);
      return;
    }

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
    setShowDialog(false);
  };

  const handleDismiss = () => {
    setShowDialog(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android': return <AndroidIcon />;
      case 'ios': return <AppleIcon />;
      case 'desktop': return <DesktopIcon />;
      default: return <MobileIcon />;
    }
  };

  const getPlatformInstructions = () => {
    switch (platform) {
      case 'android':
        return {
          title: 'Установка на Android',
          steps: [
            'Нажмите кнопку "Установить" ниже',
            'Подтвердите установку в появившемся диалоге',
            'Приложение появится на рабочем столе'
          ]
        };
      case 'ios':
        return {
          title: 'Установка на iOS',
          steps: [
            'Нажмите кнопку "Поделиться" в Safari',
            'Выберите "Добавить на экран Домой"',
            'Нажмите "Добавить" в правом верхнем углу'
          ]
        };
      case 'desktop':
        return {
          title: 'Установка на компьютер',
          steps: [
            'Нажмите кнопку "Установить" ниже',
            'Подтвердите установку в браузере',
            'Приложение появится в меню приложений'
          ]
        };
      default:
        return {
          title: 'Установка приложения',
          steps: [
            'Следуйте инструкциям браузера',
            'Подтвердите установку',
            'Приложение станет доступно как обычное приложение'
          ]
        };
    }
  };

  // Не показываем диалог если приложение уже установлено
  if (isInstalled) {
    return null;
  }

  const instructions = getPlatformInstructions();

  return (
    <Dialog
      open={showDialog}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: isMobile ? 1 : 2,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          {getPlatformIcon()}
          <Typography variant="h5" component="span">
            Установить Tire Service
          </Typography>
        </Box>
        <Chip 
          label="Рекомендуется" 
          color="primary" 
          size="small"
          sx={{ mb: 1 }}
        />
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Установите приложение для лучшего опыта использования!
        </Alert>

        {/* Преимущества установки */}
        <Typography variant="h6" gutterBottom>
          Преимущества установки:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <SpeedIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Быстрый доступ"
              secondary="Запуск одним нажатием с рабочего стола"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <OfflineIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Работа офлайн"
              secondary="Основные функции доступны без интернета"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <NotificationIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Push уведомления"
              secondary="Уведомления о бронированиях и акциях"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Нативный опыт"
              secondary="Интерфейс как у обычного мобильного приложения"
            />
          </ListItem>
        </List>

        {/* Инструкции по установке */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          {instructions.title}:
        </Typography>
        <List dense>
          {instructions.steps.map((step, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Chip 
                  label={index + 1} 
                  size="small" 
                  color="primary"
                  sx={{ minWidth: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>

        {platform === 'ios' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Важно для iOS:</strong> Используйте Safari браузер для установки. 
            В других браузерах установка может быть недоступна.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleDismiss}
          variant="outlined"
          fullWidth={isMobile}
        >
          Позже
        </Button>
        
        {deferredPrompt && platform !== 'ios' && (
          <Button
            onClick={handleInstallClick}
            variant="contained"
            startIcon={<InstallIcon />}
            fullWidth={isMobile}
            sx={{ minWidth: 140 }}
          >
            Установить
          </Button>
        )}
        
        {platform === 'ios' && (
          <Button
            onClick={handleDismiss}
            variant="contained"
            startIcon={<InstallIcon />}
            fullWidth={isMobile}
            sx={{ minWidth: 140 }}
          >
            Понятно
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt; 