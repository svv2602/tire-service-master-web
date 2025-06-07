import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { Dropdown } from '../../../../components/ui/Dropdown';

export const DropdownSection = () => {
  const items = [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: () => console.log('Редактировать')
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <SettingsIcon />,
      onClick: () => console.log('Настройки')
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: () => console.log('Удалить'),
      danger: true
    }
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Выпадающие меню
      </Typography>
      <Box display="flex" gap={4}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Иконка
          </Typography>
          <Dropdown items={items} variant="icon" />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Кнопка
          </Typography>
          <Dropdown
            items={items}
            variant="button"
            label="Действия"
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Кастомный триггер
          </Typography>
          <Dropdown
            items={items}
            trigger={
              <Button variant="contained" color="primary">
                Открыть меню
              </Button>
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DropdownSection;