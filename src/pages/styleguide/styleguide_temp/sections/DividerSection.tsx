import React from 'react';
import {
  Typography,
  Divider,
  Box,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import { SectionItem, ApiTable } from '../components';

const DividerSection: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>Разделители</Typography>
      <Typography variant="body2" paragraph>
        Разделители (Divider) - это тонкие линии, которые группируют содержимое в списках и макетах.
      </Typography>
      
      {/* 1. Базовое использование */}
      <SectionItem title="Базовое использование">
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1">
            Элемент выше разделителя
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">
            Элемент ниже разделителя
          </Typography>
        </Paper>
      </SectionItem>
      
      {/* 2. Варианты и состояния */}
      <SectionItem 
        title="Варианты" 
        description="Различные варианты разделителей"
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Стандартный разделитель:
            </Typography>
            <Divider />
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              Разделитель с отступами:
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              Вертикальный разделитель:
            </Typography>
            <Box sx={{ display: 'flex', height: 40, alignItems: 'center' }}>
              <Typography>Слева</Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Typography>Справа</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              Разделитель с текстом:
            </Typography>
            <Divider>
              <Chip label="ИЛИ" size="small" />
            </Divider>
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              Разделитель с выравниванием текста:
            </Typography>
            <Divider textAlign="left">СЛЕВА</Divider>
            <Box sx={{ my: 2 }} />
            <Divider textAlign="center">ЦЕНТР</Divider>
            <Box sx={{ my: 2 }} />
            <Divider textAlign="right">СПРАВА</Divider>
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              Разделитель с пользовательскими стилями:
            </Typography>
            <Divider sx={{ 
              borderColor: 'primary.main',
              borderWidth: 2,
              width: '50%',
              mx: 'auto'
            }} />
          </Box>
        </Stack>
      </SectionItem>
      
      {/* 3. Комбинированное использование */}
      <SectionItem title="Использование в списках">
        <Paper sx={{ p: 2 }}>
          <Box sx={{ '& > *': { py: 1 } }}>
            <Typography variant="body1">Элемент списка 1</Typography>
            <Divider />
            <Typography variant="body1">Элемент списка 2</Typography>
            <Divider />
            <Typography variant="body1">Элемент списка 3</Typography>
            <Divider />
            <Typography variant="body1">Элемент списка 4</Typography>
          </Box>
        </Paper>
      </SectionItem>
      
      {/* 4. Вертикальные разделители */}
      <SectionItem title="Вертикальные разделители">
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: 60 }}>
            <Typography variant="body1">Элемент 1</Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Typography variant="body1">Элемент 2</Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Typography variant="body1">Элемент 3</Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Typography variant="body1">Элемент 4</Typography>
          </Box>
        </Paper>
      </SectionItem>
      
      {/* 5. Разделители с содержимым */}
      <SectionItem title="Разделители с содержимым">
        <Stack spacing={3}>
          <Divider>
            <Typography variant="body2">ТЕКСТ</Typography>
          </Divider>
          
          <Divider>
            <Chip label="ТЕГ" />
          </Divider>
          
          <Divider textAlign="left">
            <Chip label="СЛЕВА" color="primary" size="small" />
          </Divider>
          
          <Divider textAlign="right">
            <Chip label="СПРАВА" color="secondary" size="small" />
          </Divider>
        </Stack>
      </SectionItem>
      
      {/* 6. API документация */}
      <SectionItem title="API">
        <ApiTable 
          props={[
            { name: 'absolute', type: 'boolean', default: 'false', description: 'Если true, разделитель имеет абсолютное позиционирование' },
            { name: 'children', type: 'node', description: 'Содержимое разделителя (обычно используется с textAlign)' },
            { name: 'component', type: 'React.ElementType', default: "'hr'", description: 'HTML-элемент, используемый для рендеринга' },
            { name: 'flexItem', type: 'boolean', default: 'false', description: 'Если true, разделитель будет элементом flex-контейнера' },
            { name: 'light', type: 'boolean', default: 'false', description: 'Если true, разделитель будет иметь более светлый цвет' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Ориентация разделителя' },
            { name: 'textAlign', type: "'center' | 'left' | 'right'", default: "'center'", description: 'Выравнивание текста в разделителе' },
            { name: 'variant', type: "'fullWidth' | 'inset' | 'middle'", default: "'fullWidth'", description: 'Вариант разделителя' },
            { name: 'sx', type: 'object', description: 'Объект стилей для кастомизации' }
          ]} 
        />
      </SectionItem>
    </>
  );
};

export default DividerSection;