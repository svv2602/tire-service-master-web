import React from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';

export interface ResponsiveColumn<T = any> {
  id: string;
  label: string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  minWidth?: number;
  maxWidth?: number;
  ellipsis?: boolean;
  sticky?: boolean;
}

export interface ResponsiveTableProps<T = any> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function ResponsiveTable<T = any>({ columns, rows, rowKey, className, style }: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));

  // Фильтруем колонки по breakpoints
  const visibleColumns = columns.filter(col => {
    if (isMobile && col.hideOnMobile) return false;
    if (isTablet && col.hideOnTablet) return false;
    return true;
  });

  return (
    <TableContainer style={{ overflowX: 'auto', ...style }} className={className}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {visibleColumns.map(col => (
              <TableCell
                key={col.id}
                style={{ minWidth: col.minWidth, maxWidth: col.maxWidth, whiteSpace: col.ellipsis ? 'nowrap' : undefined, textOverflow: col.ellipsis ? 'ellipsis' : undefined, overflow: col.ellipsis ? 'hidden' : undefined, position: col.sticky ? 'sticky' : undefined, left: col.sticky ? 0 : undefined }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={rowKey(row)}>
              {visibleColumns.map(col => (
                <TableCell
                  key={col.id}
                  style={{ minWidth: col.minWidth, maxWidth: col.maxWidth, whiteSpace: col.ellipsis ? 'nowrap' : undefined, textOverflow: col.ellipsis ? 'ellipsis' : undefined, overflow: col.ellipsis ? 'hidden' : undefined, position: col.sticky ? 'sticky' : undefined, left: col.sticky ? 0 : undefined }}
                >
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
