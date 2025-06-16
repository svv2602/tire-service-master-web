import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Stack
} from '@mui/material';
import { SectionItem, ApiTable } from '../components';

// Интерактивный пример
const InteractiveTypographyDemo: React.FC = () => {
  const [gutterBottom, setGutterBottom] = useState<boolean>(true);
  const [paragraph, setParagraph] = useState<boolean>(false);
  const [noWrap, setNoWrap] = useState<boolean>(false);
  
  return (
    <Box>
      <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={gutterBottom}
              onChange={(e) => setGutterBottom(e.target.checked)}
            />
          }
          label="gutterBottom"
        />
        <FormControlLabel
          control={
            <Switch
              checked={paragraph}
              onChange={(e) => setParagraph(e.target.checked)}
            />
          }
          label="paragraph"
        />
        <FormControlLabel
          control={
            <Switch
              checked={noWrap}
              onChange={(e) => setNoWrap(e.target.checked)}
            />
          }
          label="noWrap"
        />
      </Stack>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography 
          variant="h4" 
          gutterBottom={gutterBottom}
          paragraph={paragraph}
          noWrap={noWrap}
        >
          Заголовок с настраиваемыми параметрами
        </Typography>
        
        <Typography 
          variant="body1"
          gutterBottom={gutterBottom}
          paragraph={paragraph}
          noWrap={noWrap}
        >
          Это длинный текст, который демонстрирует различные параметры типографики. 
          Вы можете видеть, как меняется отображение текста при изменении параметров 
          gutterBottom, paragraph и noWrap. Этот текст достаточно длинный, чтобы 
          продемонстрировать эффект параметра noWrap, который предотвращает перенос текста на новую строку.
        </Typography>
      </Paper>
    </Box>
  );
};

const TypographySection: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>Типография</Typography>
      <Typography variant="body2" paragraph>
        Компонент Typography используется для стандартизации отображения текста в приложении.
        Он поддерживает различные варианты стилей, соответствующие материальному дизайну.
      </Typography>
      
      {/* 1. Базовое использование */}
      <SectionItem title="Базовое использование">
        <Typography variant="h1" gutterBottom>h1. Заголовок</Typography>
        <Typography variant="h2" gutterBottom>h2. Заголовок</Typography>
        <Typography variant="h3" gutterBottom>h3. Заголовок</Typography>
        <Typography variant="h4" gutterBottom>h4. Заголовок</Typography>
        <Typography variant="h5" gutterBottom>h5. Заголовок</Typography>
        <Typography variant="h6" gutterBottom>h6. Заголовок</Typography>
        <Typography variant="subtitle1" gutterBottom>
          subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
        <Typography variant="body1" gutterBottom>
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="button" display="block" gutterBottom>
          button text
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          caption text
        </Typography>
        <Typography variant="overline" display="block" gutterBottom>
          overline text
        </Typography>
      </SectionItem>
      
      {/* 2. Варианты и состояния */}
      <SectionItem 
        title="Варианты отображения" 
        description="Различные свойства компонента Typography"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Выравнивание текста
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" align="left" paragraph>
                Этот текст выровнен по левому краю.
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                Этот текст выровнен по центру.
              </Typography>
              <Typography variant="body1" align="right" paragraph>
                Этот текст выровнен по правому краю.
              </Typography>
              <Typography variant="body1" align="justify">
                Этот текст выровнен по ширине. Он должен быть достаточно длинным, 
                чтобы продемонстрировать эффект выравнивания по ширине, при котором 
                текст распределяется равномерно по всей ширине контейнера.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Перенос и обрезка текста
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" noWrap paragraph sx={{ border: '1px dashed', borderColor: 'divider', p: 1 }}>
                Этот текст не будет переноситься на новую строку, даже если он очень длинный и не помещается в контейнер.
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ border: '1px dashed', borderColor: 'divider', p: 1 }}>
                Этот текст будет переноситься на новую строку, если он не помещается в контейнер.
              </Typography>
              
              <Box sx={{ width: 200, border: '1px dashed', borderColor: 'divider', p: 1 }}>
                <Typography variant="body1" noWrap>
                  Этот текст обрезается в узком контейнере.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </SectionItem>
      
      {/* 3. Интерактивный пример */}
      <SectionItem 
        title="Интерактивный пример" 
        description="Настройте параметры типографики"
      >
        <InteractiveTypographyDemo />
      </SectionItem>
      
      {/* 4. Комбинированное использование */}
      <SectionItem title="Стилизация текста">
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Цветной заголовок
          </Typography>
          
          <Typography variant="body1" paragraph>
            Обычный текст с <Typography component="span" color="secondary" fontWeight="bold">выделенным</Typography> словом.
          </Typography>
          
          <Typography variant="body1" sx={{ fontStyle: 'italic' }} paragraph>
            Текст с применением пользовательских стилей через свойство sx.
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            Вы можете использовать разные <Typography component="span" sx={{ textDecoration: 'underline' }}>стили</Typography> для 
            <Typography component="span" sx={{ fontWeight: 'bold' }}> выделения </Typography> 
            <Typography component="span" color="error">важной информации</Typography>.
          </Typography>
        </Paper>
      </SectionItem>
      
      {/* 5. Семантика */}
      <SectionItem title="Семантика HTML">
        <Typography variant="body2" paragraph>
          Компонент Typography по умолчанию использует соответствующие HTML-элементы для разных вариантов, 
          но вы можете изменить это с помощью свойства component:
        </Typography>
        
        <Box sx={{ '& > *': { mb: 1 } }}>
          <Typography variant="h5" component="h2">
            Это h5 с HTML-тегом h2
          </Typography>
          
          <Typography variant="body1" component="div">
            Это body1 с HTML-тегом div
          </Typography>
          
          <Typography variant="body1" component="p">
            Это body1 с HTML-тегом p (по умолчанию)
          </Typography>
        </Box>
      </SectionItem>
      
      {/* 6. API документация */}
      <SectionItem title="API">
        <ApiTable 
          props={[
            { name: 'variant', type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline'", default: "'body1'", description: 'Вариант типографики' },
            { name: 'component', type: 'React.ElementType', description: 'HTML-элемент, используемый для рендеринга' },
            { name: 'align', type: "'inherit' | 'left' | 'center' | 'right' | 'justify'", default: "'inherit'", description: 'Выравнивание текста' },
            { name: 'color', type: "'initial' | 'inherit' | 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error'", default: "'initial'", description: 'Цвет текста' },
            { name: 'gutterBottom', type: 'boolean', default: 'false', description: 'Если true, добавляет отступ снизу' },
            { name: 'noWrap', type: 'boolean', default: 'false', description: 'Если true, текст не переносится на новую строку' },
            { name: 'paragraph', type: 'boolean', default: 'false', description: 'Если true, добавляет отступы абзаца' },
            { name: 'sx', type: 'object', description: 'Объект стилей для кастомизации' }
          ]} 
        />
      </SectionItem>
    </>
  );
};

export default TypographySection;