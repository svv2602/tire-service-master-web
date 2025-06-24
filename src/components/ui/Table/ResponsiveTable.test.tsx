import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveTable, ResponsiveColumn } from './ResponsiveTable';

describe('ResponsiveTable', () => {
  const columns: ResponsiveColumn<any>[] = [
    { id: 'name', label: 'Имя', render: row => row.name },
    { id: 'email', label: 'Email', render: row => row.email, hideOnMobile: true },
  ];
  const rows = [
    { id: 1, name: 'Иван', email: 'ivan@example.com' },
    { id: 2, name: 'Мария', email: 'maria@example.com' },
  ];

  it('renders table headers', () => {
    render(<ResponsiveTable columns={columns} rows={rows} rowKey={row => row.id} />);
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders table rows', () => {
    render(<ResponsiveTable columns={columns} rows={rows} rowKey={row => row.id} />);
    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });
});
