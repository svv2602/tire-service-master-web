import React from 'react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from './MenuItem';
import { MenuProps } from './types';

/**
 * Компонент Menu - контекстное меню с поддержкой иконок и разделителей
 */
const Menu: React.FC<MenuProps> = ({
  items,
  onSelect,
  anchorEl,
  open,
  onClose,
  ...rest
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
  };

  return (
    <MuiMenu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      {...rest}
    >
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onSelect={(selectedItem) => {
            onSelect(selectedItem);
            handleClose();
          }}
        />
      ))}
    </MuiMenu>
  );
};

export default Menu; 