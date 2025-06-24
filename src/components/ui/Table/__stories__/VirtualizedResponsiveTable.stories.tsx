import React from 'react';
import { VirtualizedResponsiveTable, ResponsiveColumn } from '../VirtualizedResponsiveTable';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'UI/Table/Virtualized Responsive Table',
  component: VirtualizedResponsiveTable,
} as ComponentMeta<typeof VirtualizedResponsiveTable>;

const columns: ResponsiveColumn<any>[] = [
  { id: 'name', label: 'Имя', render: row => row.name },
  { id: 'email', label: 'Email', render: row => row.email },
];

const rows = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}`, email: `user${i}@test.com` }));

const Template: ComponentStory<typeof VirtualizedResponsiveTable> = (args) => <VirtualizedResponsiveTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
  rowKey: (row: any) => row.id,
  height: 400,
  rowHeight: 32,
};
