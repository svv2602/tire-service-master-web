import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

// Импорты типов и API
import { RootState } from '../../../store';
import { 
  useAddToMyFavoritesMutation, 
  useRemoveFromMyFavoritesMutation,
  useCheckIsFavoriteQuery 
} from '../../../api/favoritePoints.api';

interface FavoriteButtonProps {
  servicePointId: number;
  servicePointName?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  servicePointId,
  servicePointName = '',
  size = 'medium',
  showTooltip = true,
  onToggle,
  onNotify
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Redux состояние
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Локальное состояние для оптимистичного обновления
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);

  // API хуки
  const { 
    data: favoriteData, 
    isLoading: isCheckingFavorite 
  } = useCheckIsFavoriteQuery(servicePointId, {
    skip: !isAuthenticated // Пропускаем запрос если пользователь не авторизован
  });
  
  const [addToFavorites, { isLoading: isAdding }] = useAddToMyFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemoving }] = useRemoveFromMyFavoritesMutation();

  // Определяем текущее состояние избранного
  const isFavorite = optimisticFavorite !== null ? optimisticFavorite : (favoriteData?.is_favorite || false);
  const isLoading = isCheckingFavorite || isAdding || isRemoving;

  // Обработчик клика
  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      onNotify?.(t('forms.profile.favoritePoints.authRequired'), 'warning');
      return;
    }

    if (isLoading) return;

    const newFavoriteState = !isFavorite;
    
    // Оптимистичное обновление UI
    setOptimisticFavorite(newFavoriteState);
    
    try {
      if (newFavoriteState) {
        // Добавляем в избранное
        await addToFavorites(servicePointId).unwrap();
        onNotify?.(
          t('forms.profile.favoritePoints.addedSuccess', { name: servicePointName }), 
          'success'
        );
      } else {
        // Удаляем из избранного
        if (favoriteData?.favorite_id) {
          await removeFromFavorites(favoriteData.favorite_id).unwrap();
          onNotify?.(
            t('forms.profile.favoritePoints.removedSuccess', { name: servicePointName }), 
            'success'
          );
        }
      }
      
      // Вызываем callback для родительского компонента
      onToggle?.(newFavoriteState);
      
    } catch (error: any) {
      // Возвращаем состояние обратно при ошибке
      setOptimisticFavorite(!newFavoriteState);
      
      console.error('Ошибка изменения избранного:', error);
      
      const errorMessage = newFavoriteState 
        ? t('forms.profile.favoritePoints.addError')
        : t('forms.profile.favoritePoints.removeError');
        
      onNotify?.(errorMessage, 'error');
    }
  };

  // Если пользователь не авторизован, не показываем кнопку
  if (!isAuthenticated) {
    return null;
  }

  const buttonContent = (
    <IconButton
      onClick={handleToggleFavorite}
      disabled={isLoading}
      size={size}
      sx={{
        color: isFavorite ? theme.palette.error.main : theme.palette.action.active,
        transition: 'all 0.2s ease',
        '&:hover': {
          color: isFavorite ? theme.palette.error.dark : theme.palette.error.main,
          transform: 'scale(1.1)',
        },
        '&:disabled': {
          color: theme.palette.action.disabled,
        }
      }}
    >
      {isLoading ? (
        <CircularProgress 
          size={size === 'small' ? 16 : size === 'large' ? 28 : 20} 
          color="inherit" 
        />
      ) : isFavorite ? (
        <FavoriteIcon />
      ) : (
        <FavoriteBorderIcon />
      )}
    </IconButton>
  );

  if (!showTooltip) {
    return buttonContent;
  }

  return (
    <Tooltip 
      title={
        isLoading 
          ? t('common.loading')
          : isFavorite 
            ? t('forms.profile.favoritePoints.removeFromFavorites')
            : t('forms.profile.favoritePoints.addToFavorites')
      }
      arrow
    >
      {buttonContent}
    </Tooltip>
  );
};

export default FavoriteButton; 