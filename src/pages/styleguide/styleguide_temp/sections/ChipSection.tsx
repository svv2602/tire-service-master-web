import React from 'react';
import { Box, Typography } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { Chip } from '../../../../components/ui/Chip';

export const ChipSection = () => {
  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Чипы
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip label="Стандартный" />
        <Chip label="Основной" color="primary" />
        <Chip label="Вторичный" color="secondary" />
        <Chip label="Успех" color="success" />
        <Chip label="Ошибка" color="error" />
        <Chip label="С иконкой" icon={<FaceIcon />} />
        <Chip label="Удаляемый" deletable onDelete={() => {}} />
        <Chip label="Отключенный" disabled />
        <Chip label="Outlined" variant="outlined" />
      </Box>
    </Box>
  );
};

export default ChipSection; 