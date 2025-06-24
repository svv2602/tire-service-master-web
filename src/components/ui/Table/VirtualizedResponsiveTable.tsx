import React, { useRef } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import styles from './ResponsiveTable.module.css';

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

export interface VirtualizedResponsiveTableProps<T = any> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  className?: string;
  style?: React.CSSProperties;
  rowHeight?: number;
  height?: number;
}

export function VirtualizedResponsiveTable<T = any>({ columns, rows, rowKey, className, style, rowHeight = 48, height = 400 }: VirtualizedResponsiveTableProps<T>) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));

  const visibleColumns = columns.filter(col => {
    if (isMobile && col.hideOnMobile) return false;
    if (isTablet && col.hideOnTablet) return false;
    return true;
  });

  // Виртуализированный рендер строк
  const Row = ({ index, style: rowStyle }: ListChildComponentProps) => {
    const row = rows[index];
    return (
      <TableRow key={rowKey(row)} style={rowStyle}>
        {visibleColumns.map(col => (
          <TableCell
            key={col.id}
            style={{ minWidth: col.minWidth, maxWidth: col.maxWidth, whiteSpace: col.ellipsis ? 'nowrap' : undefined, textOverflow: col.ellipsis ? 'ellipsis' : undefined, overflow: col.ellipsis ? 'hidden' : undefined, position: col.sticky ? 'sticky' : undefined, left: col.sticky ? 0 : undefined }}
          >
            {col.render(row)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <TableContainer style={{ overflowX: 'auto', ...style }} className={className ? `${className} ${styles.scrollbar}` : styles.scrollbar}>
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
          <List
            height={height}
            itemCount={rows.length}
            itemSize={rowHeight}
            width="100%"
            
          >
            {Row}
          </List>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
