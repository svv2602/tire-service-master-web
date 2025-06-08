import { CardProps as MuiCardProps } from '@mui/material';
import { ReactNode } from 'react';

/**
 * Свойства для медиа-контента карточки
 */
export interface CardMediaProps {
  /** URL изображения */
  image: string;
  /** Альтернативный текст */
  alt?: string;
  /** Высота медиа-контента в пикселях */
  height?: number;
}

/**
 * Свойства компонента Card
 */
export interface CardProps extends Omit<MuiCardProps, 'content'> {
  /** Дочерние элементы */
  children?: ReactNode;
  /** Заголовок карточки */
  title?: string;
  /** Подзаголовок карточки */
  subtitle?: string;
  /** Основной контент карточки */
  content?: ReactNode;
  /** Медиа-контент (изображение) */
  media?: CardMediaProps;
  /** Действия карточки (кнопки) */
  actions?: ReactNode;
  /** Действие карточки (одиночное) */
  action?: ReactNode;
  /** Обработчик клика по карточке */
  onClick?: () => void;
  /** Вариант отображения */
  variant?: 'elevation' | 'outlined';
  /** Уровень подъема карточки (тень) */
  elevation?: number;
  /** Эффект при наведении */
  hoverable?: boolean;
  /** Анимация */
  animated?: boolean;
}