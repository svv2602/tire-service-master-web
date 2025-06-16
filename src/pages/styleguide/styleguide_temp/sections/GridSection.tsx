import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { SectionItem, ApiTable } from '../components';

// Интерактивный пример
const InteractiveGridDemo: React.FC = () => {
  const [spacing, setSpacing] = useState<number>(2);
  const [columns, setColumns] = useState<number>(12);
  
  const handleSpacingChange = (event: Event, newValue: number | number[]) => {
    setSpacing(newValue as number);
  };
  
  const handleColumnsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setColumns(event.target.value as number);
  };
  
  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" gutterBottom>
            Расстояние между элементами:
          </Typography>
          <Slider
            value={spacing}
            onChange={handleSpacingChange}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Box>
          <Typography variant="body2" gutterBottom>
            Количество колонок:
          </Typography>
          <FormControl fullWidth>
            <Select
              value={columns}
              onChange={handleColumnsChange as any}
              size="small"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={12}>12</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Typography variant="body2" gutterBottom>
            Результат:
          </Typography>
          <Grid container spacing={spacing}>
            {Array.from({ length: columns }).map((_, index) => (
              <Grid item xs={12 / columns} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'text.secondary',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {index + 1}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

const GridSection: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>Сетка (Grid)</Typography>
      <Typography variant="body2" paragraph>
        Компонент Grid представляет собой двумерную сетку, состоящую из строк и колонок. 
        Он основан на спецификации Flexbox и обеспечивает адаптивную раскладку элементов.
      </Typography>
      
      {/* 1. Базовое использование */}
      <SectionItem title="Базовое использование">
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>xs=8</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>xs=4</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>xs=4</Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>xs=8</Paper>
          </Grid>
        </Grid>
      </SectionItem>
      
      {/* 2. Варианты и состояния */}
      <SectionItem 
        title="Адаптивная сетка" 
        description="Различные размеры для разных устройств"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              xs=12 sm=6 md=4 lg=3
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              xs=12 sm=6 md=4 lg=3
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              xs=12 sm=6 md=4 lg=3
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              xs=12 sm=6 md=4 lg=3
            </Paper>
          </Grid>
        </Grid>
      </SectionItem>
      
      {/* 3. Интерактивный пример */}
      <SectionItem 
        title="Интерактивный пример" 
        description="Настройте параметры сетки"
      >
        <InteractiveGridDemo />
      </SectionItem>
      
      {/* 4. Комбинированное использование */}
      <SectionItem title="Вложенные сетки">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Внешняя сетка (xs=12 sm=6)</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                    xs=6
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                    xs=6
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Внешняя сетка (xs=12 sm=6)</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                    xs=4
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                    xs=4
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                    xs=4
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </SectionItem>
      
      {/* 5. Выравнивание */}
      <SectionItem title="Выравнивание элементов">
        <Typography variant="body2" gutterBottom>
          Выравнивание по горизонтали:
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 1, bgcolor: 'background.default' }}>
              <Grid container justifyContent="flex-start" spacing={1}>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>Start</Paper>
                </Grid>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>Start</Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 1, bgcolor: 'background.default' }}>
              <Grid container justifyContent="center" spacing={1}>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>Center</Paper>
                </Grid>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>Center</Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 1, bgcolor: 'background.default' }}>
              <Grid container justifyContent="flex-end" spacing={1}>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>End</Paper>
                </Grid>
                <Grid item>
                  <Paper sx={{ p: 2, width: 100, textAlign: 'center' }}>End</Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        
        <Typography variant="body2" gutterBottom>
          Выравнивание по вертикали:
        </Typography>
        <Paper sx={{ p: 1, bgcolor: 'background.default', height: 150 }}>
          <Grid container alignItems="center" style={{ height: '100%' }} spacing={2}>
            <Grid item>
              <Paper sx={{ p: 2, height: 40, display: 'flex', alignItems: 'center' }}>
                По центру
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 2, height: 80, display: 'flex', alignItems: 'center' }}>
                По центру
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </SectionItem>
      
      {/* 6. API документация */}
      <SectionItem title="API">
        <ApiTable 
          props={[
            { name: 'container', type: 'boolean', default: 'false', description: 'Если true, компонент будет контейнером сетки' },
            { name: 'item', type: 'boolean', default: 'false', description: 'Если true, компонент будет элементом сетки' },
            { name: 'spacing', type: 'number | object', default: '0', description: 'Расстояние между элементами сетки' },
            { name: 'xs', type: 'auto | number | boolean', description: 'Размер элемента для экстра-маленьких экранов' },
            { name: 'sm', type: 'auto | number | boolean', description: 'Размер элемента для маленьких экранов' },
            { name: 'md', type: 'auto | number | boolean', description: 'Размер элемента для средних экранов' },
            { name: 'lg', type: 'auto | number | boolean', description: 'Размер элемента для больших экранов' },
            { name: 'xl', type: 'auto | number | boolean', description: 'Размер элемента для экстра-больших экранов' },
            { name: 'direction', type: "'row' | 'row-reverse' | 'column' | 'column-reverse'", default: "'row'", description: 'Направление элементов в контейнере' },
            { name: 'justifyContent', type: "'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'", default: "'flex-start'", description: 'Выравнивание элементов по горизонтали' },
            { name: 'alignItems', type: "'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'", default: "'stretch'", description: 'Выравнивание элементов по вертикали' }
          ]} 
        />
      </SectionItem>
    </>
  );
};

export default GridSection;