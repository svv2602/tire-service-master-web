import React from 'react';
import { Story, Meta } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from './Skeleton';
import { SkeletonProps } from './types';

export default {
  title: 'UI/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rectangular', 'circular', 'rounded'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    borderRadius: {
      control: 'number',
    },
  },
} as Meta;

const Template: Story<SkeletonProps> = (args) => <Skeleton {...args} />;

export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  width: '80%',
};

export const Paragraph = () => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h4" gutterBottom>
      <Skeleton width="50%" />
    </Typography>
    <Typography variant="body1">
      <Skeleton />
    </Typography>
    <Typography variant="body1">
      <Skeleton />
    </Typography>
    <Typography variant="body1">
      <Skeleton width="80%" />
    </Typography>
  </Box>
);

export const Rectangular = Template.bind({});
Rectangular.args = {
  variant: 'rectangular',
  width: 300,
  height: 200,
};

export const Circular = Template.bind({});
Circular.args = {
  variant: 'circular',
  width: 40,
  height: 40,
};

export const Rounded = Template.bind({});
Rounded.args = {
  variant: 'rounded',
  width: 300,
  height: 200,
  borderRadius: 16,
};

export const WaveAnimation = Template.bind({});
WaveAnimation.args = {
  variant: 'rectangular',
  width: 300,
  height: 200,
  animation: 'wave',
};

export const NoAnimation = Template.bind({});
NoAnimation.args = {
  variant: 'rectangular',
  width: 300,
  height: 200,
  animation: false,
}; 