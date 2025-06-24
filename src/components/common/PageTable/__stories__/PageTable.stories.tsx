import React from 'react';
import { PageTable } from '../PageTable';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Common/PageTable',
  component: PageTable,
} as ComponentMeta<typeof PageTable>;

const columns = [
  { id: 'name', key: 'name', label: 'Имя', render: (row: any) => row.name },
  { id: 'email', key: 'email', label: 'Email', render: (row: any) => row.email },
];

const rows = [
  { id: 1, name: 'Иван', email: 'ivan@example.com' },
  { id: 2, name: 'Мария', email: 'maria@example.com' },
];

const Template: ComponentStory<typeof PageTable> = (args) => <PageTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
  actions: [],
};
