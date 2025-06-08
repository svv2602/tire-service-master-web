import React from 'react';
import { Typography, Grid } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import SpeedDial from '../../../../components/ui/SpeedDial';
import { Card } from '../../../../components/ui/Card';

/**
 * Секция StyleGuide для демонстрации компонента SpeedDial
 */
export const SpeedDialSection: React.FC = () => {
  // Действия для демонстрации
  const actions = [
    { id: 1, icon: <FileCopyIcon />, tooltipTitle: 'Копировать', onClick: () => console.log('Копировать') },
    { id: 2, icon: <SaveIcon />, tooltipTitle: 'Сохранить', onClick: () => console.log('Сохранить') },
    { id: 3, icon: <PrintIcon />, tooltipTitle: 'Печать', onClick: () => console.log('Печать') },
    { id: 4, icon: <ShareIcon />, tooltipTitle: 'Поделиться', onClick: () => console.log('Поделиться') },
  ];

  return (
    <Card>
      <Typography variant="h4" gutterBottom>
        SpeedDial
      </Typography>
      <Typography variant="body1" paragraph>
        Компонент SpeedDial представляет собой плавающую кнопку действия (FAB), которая при нажатии
        раскрывает список дополнительных действий. Поддерживает различные позиции на экране,
        направления открытия и анимации.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Базовый пример
          </Typography>
          <div style={{ height: '200px', position: 'relative', border: '1px dashed #ccc' }}>
            <SpeedDial
              actions={actions}
              icon={<EditIcon />}
              tooltipTitle="Действия"
              margin={8}
              ariaLabel="Базовый SpeedDial"
            />
          </div>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            С отключенными действиями
          </Typography>
          <div style={{ height: '200px', position: 'relative', border: '1px dashed #ccc' }}>
            <SpeedDial
              actions={[
                ...actions.slice(0, 2),
                { ...actions[2], disabled: true },
                { ...actions[3], disabled: true },
              ]}
              tooltipTitle="Действия"
              position="bottom-left"
              margin={8}
              ariaLabel="SpeedDial с отключенными действиями"
            />
          </div>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Разные направления
          </Typography>
          <div style={{ height: '300px', position: 'relative', border: '1px dashed #ccc' }}>
            <SpeedDial
              actions={actions.slice(0, 2)}
              position="top-left"
              direction="right"
              tooltipTitle="Вправо"
              margin={8}
              ariaLabel="SpeedDial вправо"
            />
            <SpeedDial
              actions={actions.slice(0, 2)}
              position="top-right"
              direction="left"
              tooltipTitle="Влево"
              margin={8}
              ariaLabel="SpeedDial влево"
            />
            <SpeedDial
              actions={actions.slice(0, 2)}
              position="bottom-left"
              direction="up"
              tooltipTitle="Вверх"
              margin={8}
              ariaLabel="SpeedDial вверх"
            />
            <SpeedDial
              actions={actions.slice(0, 2)}
              position="bottom-right"
              direction="down"
              tooltipTitle="Вниз"
              margin={8}
              ariaLabel="SpeedDial вниз"
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

export default SpeedDialSection; 