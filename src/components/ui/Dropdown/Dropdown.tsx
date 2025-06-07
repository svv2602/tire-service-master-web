import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  MenuProps,
  Typography,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import { SIZES, ANIMATIONS, getThemeColors } from '../../../styles/theme';

export interface DropdownItem {
  /** Уникальный идентификатор пункта меню */
  id: string;
  /** Текст пункта меню */
  label: string;
  /** Иконка пункта меню */
  icon?: React.ReactNode;
  /** Колбэк клика по пункту */
  onClick?: () => void;
  /** Отключен ли пункт */
  disabled?: boolean;
  /** Опасное действие (красный цвет) */
  danger?: boolean;
}

export interface DropdownProps {
  /** Элементы меню */
  items: DropdownItem[];
  /** Кастомная кнопка открытия */
  trigger?: React.ReactNode;
  /** Позиция меню */
  position?: MenuProps['anchorOrigin'];
}

const StyledMenu = styled(Menu)(({ theme }) => {
  const colors = getThemeColors(theme);
  
  return {
    '& .MuiPaper-root': {
      backgroundColor: colors.backgroundCard,
      borderRadius: SIZES.borderRadius.md,
      border: `1px solid ${colors.borderPrimary}`,
      boxShadow: `0 4px 20px ${colors.shadowMedium}`,
      animation: `${ANIMATIONS.zoomIn} 0.2s ${ANIMATIONS.transition.cubic}`,
    },
    
    '& .MuiMenuItem-root': {
      padding: theme.spacing(1, 2),
      transition: ANIMATIONS.transition.fast,
      
      '&:hover': {
        backgroundColor: colors.backgroundHover,
      },
      
      '&.Mui-disabled': {
        opacity: 0.5,
      },
      
      '&.danger': {
        color: colors.error,
        
        '& .MuiListItemIcon-root': {
          color: colors.error,
        },
        
        '&:hover': {
          backgroundColor: colors.errorBg,
        },
      },
    },
    
    '& .MuiListItemIcon-root': {
      minWidth: 36,
      color: colors.textSecondary,
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
 * />
 */
export const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger,
  position = {
    vertical: 'bottom',
    horizontal: 'right',
  },
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    handleClose();
  };

  return (
    <>
      {trigger || (
        <IconButton
          aria-label="more"
          aria-controls={open ? 'dropdown-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
      )}
      
      <StyledMenu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={position}
        transformOrigin={{
          vertical: position.vertical === 'top' ? 'bottom' : 'top',
          horizontal: position.horizontal,
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={item.danger ? 'danger' : ''}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>
              <Typography variant="body2">
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