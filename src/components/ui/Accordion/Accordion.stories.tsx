import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Accordion, AccordionProps } from './Accordion';
import { Typography, Box, Button, TextField } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Accordion',
  component: Accordion,
  argTypes: {
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    expanded: {
      control: 'boolean',
    },
  },
} as Meta;

const Template: Story<AccordionProps> = (args) => <Accordion {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  title: 'Заголовок аккордеона',
  children: (
    <Typography>
      Это содержимое аккордеона. Здесь может быть любой контент, включая текст, 
      изображения, формы и другие компоненты.
    </Typography>
  ),
};

export const Expanded = Template.bind({});
Expanded.args = {
  title: 'Развернутый аккордеон',
  expanded: true,
  children: (
    <Typography>
      Этот аккордеон изначально развернут. Пользователь может свернуть его, 
      нажав на заголовок или иконку стрелки.
    </Typography>
  ),
};

export const Disabled = Template.bind({});
Disabled.args = {
  title: 'Отключенный аккордеон',
  disabled: true,
  children: (
    <Typography>
      Этот аккордеон отключен. Пользователь не может взаимодействовать с ним.
    </Typography>
  ),
};

// Сложный контент
export const WithRichContent = Template.bind({});
WithRichContent.args = {
  title: 'Аккордеон с формой',
  children: (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Имя" fullWidth />
      <TextField label="Email" fullWidth />
      <Button variant="contained">Отправить</Button>
    </Box>
  ),
};

// Группа аккордеонов
export const AccordionGroup = () => {
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Accordion
        title="Первая секция"
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <Typography>
          Содержимое первой секции. При открытии этой секции другие закрываются автоматически.
        </Typography>
      </Accordion>
      
      <Accordion
        title="Вторая секция"
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
      >
        <Typography>
          Содержимое второй секции. Эта группа аккордеонов работает как "аккордеон" - 
          только одна секция может быть открыта одновременно.
        </Typography>
      </Accordion>
      
      <Accordion
        title="Третья секция"
        expanded={expanded === 'panel3'}
        onChange={handleChange('panel3')}
      >
        <Typography>
          Содержимое третьей секции.
        </Typography>
      </Accordion>
    </Box>
  );
};

// Независимые аккордеоны
export const IndependentAccordions = () => {
  const [expandedState, setExpandedState] = useState({
    panel1: false,
    panel2: true,
    panel3: false,
  });

  const handleChange = (panel: keyof typeof expandedState) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedState({
      ...expandedState,
      [panel]: isExpanded,
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Accordion
        title="Первая секция"
        expanded={expandedState.panel1}
        onChange={handleChange('panel1')}
      >
        <Typography>
          Содержимое первой секции. Эти аккордеоны независимы друг от друга.
        </Typography>
      </Accordion>
      
      <Accordion
        title="Вторая секция"
        expanded={expandedState.panel2}
        onChange={handleChange('panel2')}
      >
        <Typography>
          Содержимое второй секции. Можно открыть несколько секций одновременно.
        </Typography>
      </Accordion>
      
      <Accordion
        title="Третья секция"
        expanded={expandedState.panel3}
        onChange={handleChange('panel3')}
      >
        <Typography>
          Содержимое третьей секции.
        </Typography>
      </Accordion>
    </Box>
  );
};

// Вложенные аккордеоны
export const NestedAccordions = () => (
  <Accordion title="Внешний аккордеон">
    <Box sx={{ mb: 2 }}>
      <Typography>Содержимое внешнего аккордеона.</Typography>
    </Box>
    
    <Accordion title="Вложенный аккордеон 1">
      <Typography>Содержимое вложенного аккордеона 1.</Typography>
    </Accordion>
    
    <Accordion title="Вложенный аккордеон 2">
      <Typography>Содержимое вложенного аккордеона 2.</Typography>
    </Accordion>
  </Accordion>
); 