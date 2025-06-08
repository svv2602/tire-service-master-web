import React from 'react';
import { Story, Meta } from '@storybook/react';
import Typography from '@mui/material/Typography';
import Paper from './Paper';
import { PaperProps } from './types';

export default {
  title: 'UI/Paper',
  component: Paper,
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
    },
    rounded: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large', 'full'],
    },
  },
} as Meta;

const Template: Story<PaperProps> = (args) => (
  <Paper {...args}>
    <Typography variant="h6" gutterBottom>
      Заголовок
    </Typography>
    <Typography>
      Это пример контента внутри компонента Paper. Paper используется для создания
      поверхностей с тенью, которые визуально "приподнимают" контент над фоном.
    </Typography>
  </Paper>
);

export const Default = Template.bind({});
Default.args = {};

export const Elevated = Template.bind({});
Elevated.args = {
  variant: 'elevated',
  elevation: 4,
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
};

export const Flat = Template.bind({});
Flat.args = {
  variant: 'flat',
};

export const RoundedLarge = Template.bind({});
RoundedLarge.args = {
  rounded: 'large',
  elevation: 2,
};

export const NoPadding = Template.bind({});
NoPadding.args = {
  disablePadding: true,
}; 