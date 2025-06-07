import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableProps as MuiTableProps
} from '@mui/material';

/** Колонка таблицы */
export interface Column {
  /** Идентификатор колонки */
  id: string;
  /** Заголовок колонки */
  label: string;
  /** Минимальная ширина */
  minWidth?: number;
  /** Выравнивание */
  align?: 'left' | 'right' | 'center';
  /** Форматирование значения */
  format?: (value: any) => string;
}

/** Пропсы таблицы */
export interface TableProps extends MuiTableProps {
  columns: Column[];
  rows: any[];
  stickyHeader?: boolean;
  maxHeight?: number;
  pagination?: boolean;
  rowsPerPage?: number;
}

/** 
 * Компонент таблицы с поддержкой пагинации
 */
export const Table: React.FC<TableProps> = ({
  columns,
  rows,
  stickyHeader = false,
  maxHeight,
  pagination = false,
  rowsPerPage = 10,
  ...props
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: maxHeight,
        '& .MuiTableCell-root': {
          borderBottom: '1px solid rgba(224, 224, 224, 1)'
        }
      }}
    >
      <MuiTable stickyHeader={stickyHeader} {...props}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: 'background.paper'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
              {columns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default Table;