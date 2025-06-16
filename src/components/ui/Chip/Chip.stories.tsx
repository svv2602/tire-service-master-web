import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Chip, ChipProps } from './Chip';
import { Box } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import FaceIcon from '@mui/icons-material/Face';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default {
  title: 'UI/Chip',
  component: Chip,
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      defaultValue: 'default',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      defaultValue: 'medium',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      defaultValue: 'filled',
    },
    deletable: {
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const Template: Story<ChipProps> = (args) => <Chip {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Тег',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  label: 'Тег с иконкой',
  icon: <LocalOfferIcon />,
};

export const Deletable = Template.bind({});
Deletable.args = {
  label: 'Удаляемый тег',
  deletable: true,
};

// Варианты отображения
export const Filled = Template.bind({});
Filled.args = {
  label: 'Заполненный тег',
  variant: 'filled',
};

export const Outlined = Template.bind({});
Outlined.args = {
  label: 'Контурный тег',
  variant: 'outlined',
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленький тег',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Средний тег',
  size: 'medium',
};

// Цвета
export const Primary = Template.bind({});
Primary.args = {
  label: 'Основной цвет',
  color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Вторичный цвет',
  color: 'secondary',
};

export const Success = Template.bind({});
Success.args = {
  label: 'Успех',
  color: 'success',
};

export const Error = Template.bind({});
Error.args = {
  label: 'Ошибка',
  color: 'error',
};

export const Warning = Template.bind({});
Warning.args = {
  label: 'Предупреждение',
  color: 'warning',
};

export const Info = Template.bind({});
Info.args = {
  label: 'Информация',
  color: 'info',
};

// Состояния
export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Отключенный тег',
  disabled: true,
};

export const ClickableChip = Template.bind({});
ClickableChip.args = {
  label: 'Кликабельный тег',
  onClick: () => alert('Тег нажат'),
};

// Интерактивный пример
export const Interactive = () => {
  const [chips, setChips] = useState([
    { id: 1, label: 'React', color: 'primary' as const },
    { id: 2, label: 'TypeScript', color: 'secondary' as const },
    { id: 3, label: 'Material UI', color: 'info' as const },
  ]);
  
  const handleDelete = (id: number) => {
    setChips(chips.filter(chip => chip.id !== id));
  };
  
  const handleRestore = () => {
    setChips([
      { id: 1, label: 'React', color: 'primary' as const },
      { id: 2, label: 'TypeScript', color: 'secondary' as const },
      { id: 3, label: 'Material UI', color: 'info' as const },
    ]);
  };
  
  return (
    <div>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {chips.map(chip => (
          <Chip
            key={chip.id}
            label={chip.label}
            color={chip.color}
            deletable
            onDelete={() => handleDelete(chip.id)}
          />
        ))}
      </Box>
      
      {chips.length < 3 && (
        <Chip 
          label="Восстановить все" 
          variant="outlined" 
          color="success" 
          onClick={handleRestore} 
        />
      )}
    </div>
  );
};

// Группа тегов
export const ChipGroup = () => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Chip label="Все" color="primary" />
    <Chip label="Документы" icon={<FaceIcon />} />
    <Chip label="Изображения" variant="outlined" />
    <Chip label="Видео" color="secondary" />
    <Chip label="Аудио" color="info" />
  </Box>
); 