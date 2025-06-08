import React from 'react';
import { Story, Meta } from '@storybook/react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import SpeedDial from './SpeedDial';
import { SpeedDialProps } from './types';

// Моковые действия для примеров
const actions = [
  { id: 1, icon: <FileCopyIcon />, tooltipTitle: 'Копировать', onClick: () => console.log('Копировать') },
  { id: 2, icon: <SaveIcon />, tooltipTitle: 'Сохранить', onClick: () => console.log('Сохранить') },
  { id: 3, icon: <PrintIcon />, tooltipTitle: 'Печать', onClick: () => console.log('Печать') },
  { id: 4, icon: <ShareIcon />, tooltipTitle: 'Поделиться', onClick: () => console.log('Поделиться') },
];

export default {
  title: 'UI/SpeedDial',
  component: SpeedDial,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      description: 'Позиция на экране',
    },
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
      description: 'Направление открытия',
    },
    margin: {
      control: 'number',
      description: 'Отступы от краев',
    },
  },
} as Meta;

// Базовый пример
export const Default: Story<SpeedDialProps> = (args) => (
  <div style={{ height: '100vh', position: 'relative' }}>
    <SpeedDial
      {...args}
      actions={actions}
      icon={<EditIcon />}
      tooltipTitle="Действия"
    />
  </div>
);

// Пример с разными позициями
export const Positions: Story<SpeedDialProps> = (args) => (
  <div style={{ height: '100vh', position: 'relative' }}>
    <SpeedDial
      {...args}
      actions={actions.slice(0, 2)}
      position="top-left"
      direction="down"
      tooltipTitle="Верхний левый"
    />
    <SpeedDial
      {...args}
      actions={actions.slice(0, 2)}
      position="top-right"
      direction="down"
      tooltipTitle="Верхний правый"
    />
    <SpeedDial
      {...args}
      actions={actions.slice(0, 2)}
      position="bottom-left"
      direction="up"
      tooltipTitle="Нижний левый"
    />
    <SpeedDial
      {...args}
      actions={actions.slice(0, 2)}
      position="bottom-right"
      direction="up"
      tooltipTitle="Нижний правый"
    />
  </div>
);

// Пример с отключенными действиями
export const WithDisabledActions: Story<SpeedDialProps> = (args) => (
  <div style={{ height: '100vh', position: 'relative' }}>
    <SpeedDial
      {...args}
      actions={[
        ...actions.slice(0, 2),
        { ...actions[2], disabled: true },
        { ...actions[3], disabled: true },
      ]}
      tooltipTitle="Действия"
    />
  </div>
);

// Пример с разными направлениями
export const Directions: Story<SpeedDialProps> = (args) => (
  <div style={{ height: '100vh', position: 'relative', display: 'grid', gap: '1rem', padding: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SpeedDial
        {...args}
        actions={actions.slice(0, 2)}
        direction="right"
        position="top-left"
        tooltipTitle="Вправо"
      />
      <SpeedDial
        {...args}
        actions={actions.slice(0, 2)}
        direction="left"
        position="top-right"
        tooltipTitle="Влево"
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%' }}>
      <SpeedDial
        {...args}
        actions={actions.slice(0, 2)}
        direction="up"
        position="bottom-left"
        tooltipTitle="Вверх"
      />
      <SpeedDial
        {...args}
        actions={actions.slice(0, 2)}
        direction="down"
        position="top-right"
        tooltipTitle="Вниз"
      />
    </div>
  </div>
); 