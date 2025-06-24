import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualizedResponsiveTable, ResponsiveColumn } from './VirtualizedResponsiveTable';

describe('VirtualizedResponsiveTable', () => {
  const columns: ResponsiveColumn<any>[] = [
    { id: 'name', label: 'Имя', render: row => row.name },
    { id: 'email', label: 'Email', render: row => row.email },
  ];
  const rows = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `User ${i}`, email: `user${i}@test.com` }));

  it('renders virtualized table headers', () => {
    render(<VirtualizedResponsiveTable columns={columns} rows={rows} rowKey={row => row.id} height={300} rowHeight={32} />);
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders some table rows', () => {
    render(<VirtualizedResponsiveTable columns={columns} rows={rows} rowKey={row => row.id} height={300} rowHeight={32} />);
    expect(screen.getByText('User 0')).toBeInTheDocument();
    expect(screen.getByText('user0@test.com')).toBeInTheDocument();
  });
});
