import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Button,
  MenuProps,
  ButtonProps,
  ListItemIcon,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { tokens } from '../../../styles/theme/tokens';

export interface DropdownItem {
  /** Уникальный идентификатор пункта меню */
  id: string;
  /** Текст пункта меню */
  label: string;
  /** Иконка пункта меню */
  icon?: React.ReactNode;
  /** Колбэк клика по пункту */
  onClick: () => void;
  /** Отключен ли пункт */
  disabled?: boolean;
  /** Опасное действие (красный цвет) */
  danger?: boolean;
  /** Разделитель */
  divider?: boolean;
}

export interface DropdownProps {
  /** Элементы меню */
  items: DropdownItem[];
  /** Вариант отображения */
  variant?: 'icon' | 'button';
  /** Пропсы для кнопки */
  buttonProps?: ButtonProps;
  /** Пропсы для меню */
  menuProps?: Omit<MenuProps, 'open' | 'onClose' | 'anchorEl'>;
  /** Текст кнопки */
  label?: string;
  /** Кастомный триггер */
  trigger?: React.ReactNode;
}

// Стилизованное меню
const StyledMenu = styled(Menu)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiPaper-root': {
      backgroundColor: themeColors.backgroundPrimary,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.lg,
      overflow: 'visible',
      border: `1px solid ${themeColors.borderPrimary}`,
      marginTop: tokens.spacing.sm,
      
      '& .MuiMenuItem-root': {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize.md,
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        borderRadius: tokens.borderRadius.sm,
        margin: tokens.spacing.xxs,
        transition: tokens.transitions.duration.fast,
        
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
        
        '&.Mui-disabled': {
          color: themeColors.textDisabled,
        },
        
        '&.danger': {
          color: themeColors.error,
          
          '& .MuiListItemIcon-root': {
            color: themeColors.error,
          },
          
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? `${themeColors.errorDark}20` 
              : `${themeColors.errorLight}40`,
          },
        },
        
        '& .MuiListItemIcon-root': {
          color: themeColors.textSecondary,
          minWidth: '36px',
        },
        
        '& .MuiTypography-root': {
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.fontSize.md,
        },
      },
      
      '& .MuiDivider-root': {
        margin: `${tokens.spacing.xs} 0`,
        backgroundColor: themeColors.borderPrimary,
      },
    },
  };
});

/**
 * Компонент выпадающего меню
 * 
 * @example
 * <Dropdown
 *   items={[
 *     { id: 'edit', label: 'Редактировать', icon: <EditIcon /> },
 *     { id: 'delete', label: 'Удалить', icon: <DeleteIcon />, danger: true },
 *   ]}
 *   trigger={<Button>Открыть меню</Button>}
 * />
 */
export const Dropdown: React.FC<DropdownProps> = ({
  items,
  variant = 'icon',
  buttonProps,
  menuProps,
  label,
  trigger
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleItemClick = (onClick: () => void) => {
    handleClose();
    onClick();
  };

  return (
    <>
      {trigger ? (
        <Box onClick={handleClick} sx={{ display: 'inline-block', cursor: 'pointer' }}>
          {trigger}
        </Box>
      ) : variant === 'icon' ? (
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: themeColors.textPrimary,
            transition: tokens.transitions.duration.fast,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
            ...buttonProps?.sx,
          }}
          {...buttonProps}
        >
          <MoreVertIcon />
        </IconButton>
      ) : (
        <Button
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.fontSize.md,
            transition: tokens.transitions.duration.normal,
            ...buttonProps?.sx,
          }}
          {...buttonProps}
        >
          {label}
        </Button>
      )}
      
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        elevation={0}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        {...menuProps}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleItemClick(item.onClick)}
            disabled={item.disabled}
            className={item.danger ? 'danger' : ''}
            divider={item.divider}
          >
            {item.icon && (
              <ListItemIcon 
                sx={{
                  color: item.danger ? themeColors.error : themeColors.textSecondary,
                  minWidth: '36px',
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText>
              <Typography 
                variant="body2"
                sx={{
                  fontFamily: tokens.typography.fontFamily,
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: item.danger ? themeColors.error : 'inherit',
                }}
              >
                {item.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

export default Dropdown;