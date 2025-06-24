import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Tooltip, TooltipProps } from './Tooltip';
import { Button, IconButton, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';

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

export const LongText = Template.bind({});
LongText.args = {
  title: 'Это длинная подсказка с дополнительной информацией о функциональности кнопки',
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
  title: 'Подсказка с задержкой появления (1 секунда)',
  enterDelay: 1000,
};

export const FastTooltip = Template.bind({});
FastTooltip.args = {
  title: 'Быстрая подсказка (без задержки)',
  enterDelay: 0,
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

// Максимальная ширина
export const WithCustomWidth = Template.bind({});
WithCustomWidth.args = {
  title: 'Очень длинная подсказка которая должна переноситься на несколько строк для демонстрации работы maxWidth',
  maxWidth: 200,
};

export const WideTooltip = Template.bind({});
WideTooltip.args = {
  title: 'Широкая подсказка с большим количеством текста для демонстрации',
  maxWidth: 500,
};

// Группа тултипов
export const TooltipGroup = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 4 }}>
    <Tooltip title="Редактировать" arrow>
      <IconButton>
        <EditIcon />
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Удалить" arrow>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Добавить" arrow>
      <IconButton>
        <AddIcon />
      </IconButton>
    </Tooltip>
    
    <Tooltip title="Поделиться" arrow>
      <IconButton>
        <ShareIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

// Разные варианты в группе
export const MixedVariants = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 4 }}>
    <Tooltip title="Темная подсказка" variant="dark" arrow>
      <Button variant="contained">Темная</Button>
    </Tooltip>
    
    <Tooltip title="Светлая подсказка" variant="light" arrow>
      <Button variant="outlined">Светлая</Button>
    </Tooltip>
    
    <Tooltip title="Без стрелки" arrow={false}>
      <Button variant="text">Без стрелки</Button>
    </Tooltip>
  </Box>
); 