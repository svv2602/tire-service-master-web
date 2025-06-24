import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageTable } from './PageTable';

describe('PageTable', () => {
  const columns = [
    { id: 'name', key: 'name', label: 'Имя', render: (row: any) => row.name },
    { id: 'email', key: 'email', label: 'Email', render: (row: any) => row.email },
  ];
  const rows = [
    { id: 1, name: 'Иван', email: 'ivan@example.com' },
    { id: 2, name: 'Мария', email: 'maria@example.com' },
  ];
  it('renders PageTable headers', () => {
    render(
      <PageTable columns={columns} rows={rows} actions={[]} />
    );
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
  it('renders PageTable rows', () => {
    render(
      <PageTable columns={columns} rows={rows} actions={[]} />
    );
    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });
});
