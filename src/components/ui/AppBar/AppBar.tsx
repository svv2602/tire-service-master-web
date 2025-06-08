import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, useTheme, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Стилизованный AppBar с поддержкой темной темы
const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.default 
    : theme.palette.primary.main,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

// Стилизованный Toolbar с адаптивными отступами
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 4),
  },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

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

  return (
    <React.Fragment>
      <StyledAppBar 
        position={position}
        enableColorOnDark={enableColorOnDark}
      >
        <StyledToolbar>
          {/* Кнопка меню */}
          {onMenuClick && (
            <IconButton
              color="inherit"
              aria-label="открыть меню"
              onClick={onMenuClick}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Заголовок */}
          <Typography 
            variant="h6" 
            component="h1"
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>

          {/* Дополнительные действия */}
          {actions && (
            <Box sx={{ ml: 2 }}>
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