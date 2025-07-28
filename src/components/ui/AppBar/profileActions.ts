import { UserRole, User } from '../../../types';
import { TFunction } from 'i18next';
import { AppBarAction } from './AppBar';
import {
  Person as PersonIcon,
  BookOnline as BookOnlineIcon,
  RateReview as ReviewIcon,
  AdminPanelSettings as AdminIcon,
  Web as WebIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { NavigateFunction } from 'react-router-dom';

export function getProfileActions({
  user,
  isAuthenticated,
  navigate,
  isAdminPanel,
  onLogout,
  t,
}: {
  user: User | null;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  isAdminPanel: boolean;
  onLogout: () => void;
  t: TFunction;
}): AppBarAction[] {
  // Расширяем права доступа к админ-панели для партнеров, операторов и менеджеров
  const hasAdminAccess = user?.role === UserRole.ADMIN || 
                        user?.role === UserRole.MANAGER || 
                        user?.role === UserRole.PARTNER || 
                        user?.role === UserRole.OPERATOR;

  if (!isAuthenticated) {
    return [
      {
        label: t('userMenu.login'),
        icon: LoginIcon,
        onClick: () => navigate('/login'),
      },
      {
        label: t('userMenu.register'),
        icon: RegisterIcon,
        onClick: () => navigate('/auth/register'),
      },
    ];
  }

  const actions: AppBarAction[] = [
    {
      label: t('userMenu.profile'),
      icon: PersonIcon,
      onClick: () => navigate('/client/profile'),
    },
    {
      label: t('userMenu.myBookings'),
      icon: BookOnlineIcon,
      onClick: () => navigate('/client/bookings'),
    },
    {
      label: t('userMenu.myReviews'),
      icon: ReviewIcon,
      onClick: () => navigate('/client/reviews'),
    },
  ];

  if (hasAdminAccess) {
    if (isAdminPanel) {
      actions.push({
        label: t('userMenu.toWebsite'),
        icon: WebIcon,
        onClick: () => navigate('/client'),
      });
    } else {
      actions.push({
        label: t('userMenu.adminPanel'),
        icon: AdminIcon,
        onClick: () => navigate('/admin'),
      });
    }
  }

  actions.push({
    label: t('userMenu.logout'),
    icon: LogoutIcon,
    onClick: onLogout,
  });

  return actions;
}
