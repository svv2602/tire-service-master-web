import React from 'react';
import MuiList from '@mui/material/List';
import { ListProps } from './types';

/**
 * Компонент List - контейнер для элементов списка
 */
const List: React.FC<ListProps> = ({
  compact = false,
  disableGutters = false,
  children,
  ...rest
}) => {
  return (
    <MuiList
      dense={compact}
      disablePadding={disableGutters}
      {...rest}
    >
      {children}
    </MuiList>
  );
};

export default List; 