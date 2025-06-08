import React from 'react';
import { Story, Meta } from '@storybook/react';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import { List, ListItem, ListProps } from './index';

export default {
  title: 'UI/List',
  component: List,
} as Meta;

const Template: Story<ListProps> = (args) => (
  <List {...args}>
    <ListItem>Простой элемент списка</ListItem>
    <ListItem secondaryText="Дополнительное описание">
      Элемент с описанием
    </ListItem>
    <ListItem
      startIcon={<FolderIcon />}
      endIcon={<DeleteIcon />}
      secondaryText="С иконками и описанием"
    >
      Элемент с иконками
    </ListItem>
  </List>
);

export const Default = Template.bind({});
Default.args = {};

export const Compact = Template.bind({});
Compact.args = {
  compact: true,
};

export const WithoutGutters = Template.bind({});
WithoutGutters.args = {
  disableGutters: true,
}; 