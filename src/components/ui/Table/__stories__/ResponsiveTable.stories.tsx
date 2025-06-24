import React from 'react';
import { ResponsiveTable, ResponsiveColumn } from '../ResponsiveTable';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'UI/Table/Responsive Table',
  component: ResponsiveTable,
} as ComponentMeta<typeof ResponsiveTable>;

const columns: ResponsiveColumn<any>[] = [
  { id: 'name', label: 'Имя', render: row => row.name },
  { id: 'email', label: 'Email', render: row => row.email, hideOnMobile: true },
];

const rows = [
  { id: 1, name: 'Иван', email: 'ivan@example.com' },
  { id: 2, name: 'Мария', email: 'maria@example.com' },
];

const Template: ComponentStory<typeof ResponsiveTable> = (args) => <ResponsiveTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
  rowKey: (row: any) => row.id,
};
