import React from 'react';
import MuiListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ListItemProps } from './types';

/**
 * Компонент ListItem - элемент списка с поддержкой иконок и дополнительного текста
 */
const ListItem: React.FC<ListItemProps> = ({
  compact = false,
  disableGutters = false,
  startIcon,
  endIcon,
  secondaryText,
  children,
  ...rest
}) => {
  return (
    <MuiListItem
      dense={compact}
      disableGutters={disableGutters}
      {...rest}
    >
      {startIcon && (
        <ListItemIcon sx={{ minWidth: compact ? 36 : 40 }}>
          {startIcon}
        </ListItemIcon>
      )}
      
      <ListItemText
        primary={children}
        secondary={secondaryText}
        primaryTypographyProps={{
          variant: compact ? 'body2' : 'body1',
        }}
        secondaryTypographyProps={{
          variant: compact ? 'caption' : 'body2',
        }}
      />

      {endIcon && (
        <ListItemIcon sx={{ minWidth: compact ? 36 : 40 }}>
          {endIcon}
        </ListItemIcon>
      )}
    </MuiListItem>
  );
};

export default ListItem; 