import React from 'react';
import { styled } from '@mui/material/styles';
import MuiToolbar from '@mui/material/Toolbar';
import { ToolbarProps } from './types';
import { useTheme } from '@mui/material';

// Стилизованный компонент Toolbar
const StyledToolbar = styled(MuiToolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // Необходимый отступ для fixed AppBar
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  
  // Адаптивные стили
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 0.5),
  },
}));

/**
 * Компонент Toolbar - панель инструментов, обычно используется внутри AppBar
 * Поддерживает все пропсы MUI Toolbar и дополнительные кастомные пропсы
 */
const Toolbar: React.FC<ToolbarProps> = ({
  children,
  className,
  disableGutters = false,
  variant = 'regular',
  ...rest
}) => {
  const theme = useTheme();

  return (
    <StyledToolbar
      className={className}
      disableGutters={disableGutters}
      variant={variant}
      {...rest}
    >
      {children}
    </StyledToolbar>
  );
};

export default Toolbar; 