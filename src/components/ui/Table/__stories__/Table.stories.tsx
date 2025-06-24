import React from 'react';
import { Table, Column } from '../Table';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'UI/Table/Base Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const columns: Column[] = [
  { id: 'name', label: 'Имя', format: (value: any) => value },
  { id: 'email', label: 'Email', format: (value: any) => value },
];

const rows = [
  { id: 1, name: 'Иван', email: 'ivan@example.com' },
  { id: 2, name: 'Мария', email: 'maria@example.com' },
];

const Template: ComponentStory<typeof Table> = (args) => <Table {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
};
