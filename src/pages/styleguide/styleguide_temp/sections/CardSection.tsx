import React from 'react';
import { Typography, Box } from '@mui/material';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export const CardSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Карточки
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Простая карточка
        </Typography>
        <Card
          title="Простая карточка"
          hoverable
        >
          Содержимое карточки
        </Card>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Карточка с действиями
        </Typography>
        <Card
          title="Карточка с действиями"
          action={
            <>
              <Button variant="secondary">Отмена</Button>
              <Button variant="primary">ОК</Button>
            </>
          }
          hoverable
          animated
        >
          Карточка с кнопками действий
        </Card>
      </Box>
    </Box>
  );
};

export default CardSection;