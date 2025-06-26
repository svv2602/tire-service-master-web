import { UserRole, User } from '../../../types';
import { AppBarAction } from './AppBar';
import {
  Person as PersonIcon,
  BookOnline as BookOnlineIcon,
  RateReview as ReviewIcon,
  AdminPanelSettings as AdminIcon,
  Web as WebIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { NavigateFunction } from 'react-router-dom';

export function getProfileActions({
  user,
  isAuthenticated,
  navigate,
  isAdminPanel,
  onLogout,
}: {
  user: User | null;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  isAdminPanel: boolean;
  onLogout: () => void;
}): AppBarAction[] {
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  if (!isAuthenticated) {
    return [
      {
        label: 'Увійти',
        icon: LoginIcon,
        onClick: () => navigate('/login'),
      },
    ];
  }

  const actions: AppBarAction[] = [
    {
      label: 'Профіль',
      icon: PersonIcon,
      onClick: () => navigate('/client/profile'),
    },
    {
      label: 'Мої записи',
      icon: BookOnlineIcon,
      onClick: () => navigate('/client/bookings'),
    },
    {
      label: 'Мої відгуки',
      icon: ReviewIcon,
      onClick: () => navigate('/client/reviews'),
    },
  ];

  if (isAdmin) {
    if (isAdminPanel) {
      actions.push({
        label: 'На сайт',
        icon: WebIcon,
        onClick: () => navigate('/client'),
      });
    } else {
      actions.push({
        label: 'Адмін-панель',
        icon: AdminIcon,
        onClick: () => navigate('/admin'),
      });
    }
  }

  actions.push({
    label: 'Вийти',
    icon: LogoutIcon,
    onClick: onLogout,
  });

  return actions;
}
