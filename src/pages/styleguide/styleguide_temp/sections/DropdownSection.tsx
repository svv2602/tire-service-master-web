import React from 'react';
import { Typography, Box, Grid, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import { Dropdown } from '../../../../components/ui/Dropdown';

export const DropdownSection: React.FC = () => {
  const items = [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: () => console.log('Edit clicked'),
    },
    {
      id: 'share',
      label: 'Поделиться',
      icon: <ShareIcon />,
      onClick: () => console.log('Share clicked'),
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: () => console.log('Delete clicked'),
      danger: true,
    },
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Выпадающие меню
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item>
          <Typography variant="h6" gutterBottom>
            Стандартное меню
          </Typography>
          <Dropdown items={items} />
        </Grid>
        
        <Grid item>
          <Typography variant="h6" gutterBottom>
            С кастомным триггером
          </Typography>
          <Dropdown
            items={items}
            trigger={
              <Button variant="contained" color="primary">
                Открыть меню
              </Button>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DropdownSection;