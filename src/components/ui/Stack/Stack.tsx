import React from 'react';
import {
  Stack as MuiStack,
  StackProps as MuiStackProps,
  styled,
} from '@mui/material';

export interface StackProps extends MuiStackProps {
  /** Направление стека */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Расстояние между элементами */
  spacing?: number | string;
  /** Выравнивание по горизонтали */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  /** Выравнивание по вертикали */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  /** Перенос элементов */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Содержимое стека */
  children?: React.ReactNode;
  /** Разделитель между элементами */
  divider?: React.ReactNode;
  /** Кастомные стили */
  sx?: Record<string, any>;
}

const StyledStack = styled(MuiStack)(({ theme }) => ({
  // Дополнительные стили можно добавить здесь
}));

/**
 * Компонент Stack - контейнер для вертикального или горизонтального расположения элементов
 * 
 * @example
 * <Stack direction="row" spacing={2} alignItems="center">
 *   <Button variant="contained">Кнопка 1</Button>
 *   <Button variant="outlined">Кнопка 2</Button>
 * </Stack>
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  spacing = 1,
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  flexWrap = 'nowrap',
  children,
  divider,
  sx,
  ...props
}) => {
  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      justifyContent={justifyContent}
      alignItems={alignItems}
      flexWrap={flexWrap}
      divider={divider}
      sx={sx}
      {...props}
    >
      {children}
    </StyledStack>
  );
};

export default Stack;