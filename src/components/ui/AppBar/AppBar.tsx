import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, useTheme, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный AppBar с поддержкой темной темы
const StyledAppBar = styled(MuiAppBar)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: theme.palette.mode === 'dark' 
      ? themeColors.backgroundSecondary
      : themeColors.primary,
    boxShadow: tokens.shadows.md,
    transition: tokens.transitions.duration.normal,
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
  };
});

// Стилизованный Toolbar с адаптивными отступами
const StyledToolbar = styled(Toolbar)(({ theme }) => {
  return {
    padding: `${tokens.spacing.xs} ${tokens.spacing.lg}`,
    [theme.breakpoints.up('sm')]: {
      padding: `${tokens.spacing.xs} ${tokens.spacing.xl}`,
    },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '64px',
  };
});

// Стилизованная кнопка меню
const StyledIconButton = styled(IconButton)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
    marginRight: tokens.spacing.md,
    padding: tokens.spacing.xs,
    transition: tokens.transitions.duration.normal,
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
    },
  };
});

// Стилизованный заголовок
const StyledTitle = styled(Typography)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.medium,
    color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
  };
});

interface AppBarProps {
  /** Заголовок в AppBar */
  title: string;
  /** Колбэк для открытия бокового меню */
  onMenuClick?: () => void;
  /** Дополнительные действия справа */
  actions?: React.ReactNode;
  /** Позиция AppBar */
  position?: 'fixed' | 'absolute' | 'relative' | 'static' | 'sticky';
  /** Включить поддержку цвета в темной теме */
  enableColorOnDark?: boolean;
}

/**
 * Компонент AppBar - верхняя панель приложения
 * 
 * @example
 * ```tsx
 * <AppBar 
 *   title="Панель управления"
 *   onMenuClick={() => setMenuOpen(true)}
 *   actions={<Button color="inherit">Выйти</Button>}
 * />
 * ```
 */
export const AppBar: React.FC<AppBarProps> = ({
  title,
  onMenuClick,
  actions,
  position = 'fixed',
  enableColorOnDark = true,
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  return (
    <React.Fragment>
      <StyledAppBar 
        position={position}
        enableColorOnDark={enableColorOnDark}
      >
        <StyledToolbar>
          {/* Кнопка меню */}
          {onMenuClick && (
            <StyledIconButton
              aria-label="открыть меню"
              onClick={onMenuClick}
              edge="start"
            >
              <MenuIcon />
            </StyledIconButton>
          )}

          {/* Заголовок */}
          <StyledTitle variant="h6" component="h1">
            {title}
          </StyledTitle>

          {/* Дополнительные действия */}
          {actions && (
            <Box sx={{ marginLeft: tokens.spacing.md }}>
              {actions}
            </Box>
          )}
        </StyledToolbar>
      </StyledAppBar>

      {/* Отступ для фиксированного AppBar */}
      {position === 'fixed' && <Toolbar />}
    </React.Fragment>
  );
};

export default AppBar;