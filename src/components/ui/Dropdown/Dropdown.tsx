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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
          {...buttonProps}
        >
          <MoreVertIcon />
        </IconButton>
      ) : (
        <Button
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          {...buttonProps}
        >
          {label}
        </Button>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            },
            '& .MuiDivider-root': {
              my: 1
            }
          }
        }}
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
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>
              <Typography variant="body2">
                {item.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Dropdown;