import React from 'react';
import MuiMenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { MenuItemComponentProps } from './types';

/**
 * Компонент элемента меню
 */
const MenuItem: React.FC<MenuItemComponentProps> = ({
  item,
  onSelect,
  ...rest
}) => {
  const handleClick = () => {
    onSelect(item);
  };

  return (
    <>
      <MuiMenuItem
        onClick={handleClick}
        disabled={item.disabled}
        {...rest}
      >
        {item.icon && (
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
        )}
        <ListItemText primary={item.label} />
      </MuiMenuItem>
      {item.divider && <Divider />}
    </>
  );
};

export default MenuItem; 