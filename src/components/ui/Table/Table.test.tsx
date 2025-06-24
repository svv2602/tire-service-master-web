import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, Column } from './Table';

describe('Table', () => {
  const columns: Column[] = [
    {
      id: 'name',
      label: 'Имя',
      format: (value: any) => value,
    },
    {
      id: 'email',
      label: 'Email',
      format: (value: any) => value,
    },
  ];
  const rows = [
    { id: 1, name: 'Иван', email: 'ivan@example.com' },
    { id: 2, name: 'Мария', email: 'maria@example.com' },
  ];

  it('renders table headers', () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders table rows', () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });
});
