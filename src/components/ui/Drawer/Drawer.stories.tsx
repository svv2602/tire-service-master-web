import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Drawer from './Drawer';
import { DrawerProps } from './types';

export default {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const DrawerContent = () => (
  <List>
    {['Входящие', 'Помеченные', 'Отправленные', 'Черновики'].map((text, index) => (
      <ListItem button key={text}>
        <ListItemIcon>
          {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItem>
    ))}
  </List>
);

const Template: Story<DrawerProps> = (args) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Button onClick={() => setOpen(true)} sx={{ m: 2 }}>
        Открыть drawer
      </Button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)}>
        <DrawerContent />
      </Drawer>
    </Box>
  );
};

export const Temporary = Template.bind({});
Temporary.args = {
  variant: 'temporary',
};

export const Persistent = Template.bind({});
Persistent.args = {
  variant: 'persistent',
};

export const Mini = Template.bind({});
Mini.args = {
  variant: 'mini',
};

export const RightSide = Template.bind({});
RightSide.args = {
  anchor: 'right',
};

export const CustomWidth = Template.bind({});
CustomWidth.args = {
  width: 320,
}; 