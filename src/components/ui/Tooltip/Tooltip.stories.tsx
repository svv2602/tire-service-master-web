import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Tooltip, TooltipProps } from './Tooltip';
import { Button, IconButton, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'],
      defaultValue: 'top',
    },
    arrow: {
      control: 'boolean',
      defaultValue: true,
    },
    variant: {
      control: 'select',
      options: ['light', 'dark'],
      defaultValue: 'dark',
    },
    enterDelay: {
      control: 'number',
      defaultValue: 200,
    },
    leaveDelay: {
      control: 'number',
      defaultValue: 0,
    },
  },
} as Meta;

const Template: Story<TooltipProps> = (args) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <Tooltip {...args}>
      <Button variant="contained">Наведите курсор</Button>
    </Tooltip>
  </Box>
);

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  title: 'Это подсказка',
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  title: 'Заголовок подсказки',
  description: 'Дополнительное описание с более подробной информацией о функциональности.',
};

// Размещение
export const Top = Template.bind({});
Top.args = {
  title: 'Сверху',
  placement: 'top',
};

export const Bottom = Template.bind({});
Bottom.args = {
  title: 'Снизу',
  placement: 'bottom',
};

export const Left = Template.bind({});
Left.args = {
  title: 'Слева',
  placement: 'left',
};

export const Right = Template.bind({});
Right.args = {
  title: 'Справа',
  placement: 'right',
};

// Варианты внешнего вида
export const WithArrow = Template.bind({});
WithArrow.args = {
  title: 'Подсказка со стрелкой',
  arrow: true,
};

export const WithoutArrow = Template.bind({});
WithoutArrow.args = {
  title: 'Подсказка без стрелки',
  arrow: false,
};

export const LightVariant = Template.bind({});
LightVariant.args = {
  title: 'Светлый вариант',
  variant: 'light',
};

export const DarkVariant = Template.bind({});
DarkVariant.args = {
  title: 'Темный вариант',
  variant: 'dark',
};

// Задержки
export const WithDelay = Template.bind({});
WithDelay.args = {
  title: 'Подсказка с задержкой появления',
  enterDelay: 1000,
  description: 'Эта подсказка появится через 1 секунду после наведения',
};

// Различные триггеры
export const WithIcon = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <Tooltip title="Информация" arrow>
      <IconButton>
        <InfoIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

export const WithText = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <Tooltip title="Это специальный термин" arrow>
      <Typography sx={{ textDecoration: 'underline', cursor: 'help' }}>
        Наведите на этот текст
      </Typography>
    </Tooltip>
  </Box>
);

// Сложный контент
export const WithRichContent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
            Расширенная подсказка
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Подсказки могут содержать:
          </Typography>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>Форматированный текст</li>
            <li>Списки</li>
            <li>И другие элементы</li>
          </ul>
        </Box>
      }
      arrow
    >
      <Button variant="outlined" startIcon={<HelpOutlineIcon />}>
        Подробная информация
      </Button>
    </Tooltip>
  </Box>
);

// Группа тултипов
export const TooltipGroup = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 4 }}>
    <Tooltip title="Редактировать" arrow>
      <IconButton>
        <span className="material-icons">edit</span>
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Удалить" arrow>
      <IconButton>
        <span className="material-icons">delete</span>
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Добавить" arrow>
      <IconButton>
        <span className="material-icons">add</span>
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Поделиться" arrow>
      <IconButton>
        <span className="material-icons">share</span>
      </IconButton>
    </Tooltip>
  </Box>
); 