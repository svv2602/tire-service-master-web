import React from 'react';
import { styled } from '@mui/material/styles';
import MuiDivider from '@mui/material/Divider';
import { DividerProps } from './types';

// Стилизованный компонент для текста
const DividerText = styled('span')<{ padding?: number | string }>(({ theme, padding }) => ({
  padding: padding !== undefined ? padding : theme.spacing(0, 2),
}));

/**
 * Компонент Divider - разделительная линия с опциональным текстом
 */
const Divider: React.FC<DividerProps> = ({
  text,
  textPadding,
  children,
  ...rest
}) => {
  const content = text || children;

  if (!content) {
    return <MuiDivider {...rest} />;
  }

  return (
    <MuiDivider {...rest}>
      <DividerText padding={textPadding}>
        {content}
      </DividerText>
    </MuiDivider>
  );
};

export default Divider; 