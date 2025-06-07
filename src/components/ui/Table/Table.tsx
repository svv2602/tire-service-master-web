import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

/** Колонка таблицы */
export interface Column {
  /** Идентификатор колонки */
  id: string;
  /** Заголовок колонки */
  label: string;
  /** Минимальная ширина */
  minWidth?: number;
  /** Выравнивание */
  align?: 'right' | 'left' | 'center';
  /** Форматирование значения */
  format?: (value: any) => string;
}

/** Пропсы таблицы */
export interface TableProps {
  /** Колонки */
  columns: Column[];
  /** Строки */
  rows: Record<string, any>[];
  /** Включить пагинацию */
  pagination?: boolean;
  /** Строк на странице */
  rowsPerPage?: number;
}

/** Стилизованный контейнер таблицы */
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[100],
  },
}));

/** 
 * Компонент таблицы с поддержкой пагинации
 */
export const Table: React.FC<TableProps> = ({
  columns,
  rows,
  pagination = false,
  rowsPerPage: defaultRowsPerPage = 5
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const displayedRows = pagination
    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : rows;

  return (
    <StyledPaper>
      <TableContainer>
        <MuiTable stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((row, index) => (
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
        {pagination && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </StyledPaper>
  );
};

export default Table;