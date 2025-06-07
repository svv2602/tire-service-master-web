import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps as MuiBreadcrumbsProps,
  Link,
  Typography
} from '@mui/material';

/** Элемент хлебных крошек */
export interface BreadcrumbItem {
  /** Текст */
  label: string;
  /** Ссылка */
  href?: string;
  /** Иконка */
  icon?: React.ReactNode;
}

/** Пропсы хлебных крошек */
export interface BreadcrumbsProps extends Omit<MuiBreadcrumbsProps, 'children'> {
  /** Элементы */
  items: BreadcrumbItem[];
}

/**
 * Компонент хлебных крошек
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Главная', href: '/' },
 *     { label: 'Категория', href: '/category' },
 *     { label: 'Страница' },
 *   ]}
 * />
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  ...props
}) => {
  return (
    <MuiBreadcrumbs {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = (
          <>
            {item.icon}
            {item.icon && ' '}
            {item.label}
          </>
        );

        if (isLast) {
          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {content}
            </Typography>
          );
        }

        return item.href ? (
          <Link
            key={index}
            href={item.href}
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {content}
          </Link>
        ) : (
          <Typography
            key={index}
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {content}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs; 