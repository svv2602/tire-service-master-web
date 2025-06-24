import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableProps as MuiTableProps,
  styled
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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
  /** Перенос по словам */
  wrap?: boolean;
  /** Форматирование значения */
  format?: (value: any, row?: any) => string | React.ReactNode;
}

/** Пропсы таблицы */
export interface TableProps extends MuiTableProps {
  columns: Column[];
  rows: any[];
  stickyHeader?: boolean;
  maxHeight?: number;
  pagination?: boolean;
  rowsPerPage?: number;
  /** Функция для получения дополнительных пропсов строки */
  getRowProps?: (row: any, index: number) => Record<string, any>;
}

// Стилизованный Paper для контейнера таблицы
const StyledPaper = styled(Paper)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    borderRadius: tokens.borderRadius.md,
    boxShadow: tokens.shadows.sm,
    overflow: 'hidden',
    border: `1px solid ${themeColors.borderPrimary}`,
    transition: tokens.transitions.duration.normal,
    backgroundColor: themeColors.backgroundCard,
  };
});

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'wrap',
})<{ wrap?: boolean }>(({ theme, wrap }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
    color: themeColors.textPrimary,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    transition: tokens.transitions.duration.normal,
    // Стили переноса слов
    ...(wrap ? {
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      hyphens: 'auto',
      wordWrap: 'break-word', // Для старых браузеров
    } : {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  };
});

const StyledHeaderCell = styled(StyledTableCell)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: themeColors.backgroundSecondary,
    color: themeColors.textPrimary,
    fontWeight: tokens.typography.fontWeights.medium,
    fontSize: tokens.typography.fontSize.sm,
  };
});

const StyledTableRow = styled(TableRow)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '&:hover': {
      backgroundColor: themeColors.backgroundHover,
    },
    '&:last-child td, &:last-child th': {
      borderBottom: 0,
    },
  };
});

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
  getRowProps,
  ...props
}) => {
  return (
    <StyledPaper>
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} {...props}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledHeaderCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </StyledHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const rowProps = getRowProps ? getRowProps(row, index) : {};
              return (
                <StyledTableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={index}
                  {...rowProps}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <StyledTableCell 
                        key={column.id} 
                        align={column.align}
                        wrap={column.wrap}
                      >
                        {column.format ? column.format(value, row) : value}
                      </StyledTableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </StyledPaper>
  );
};

export default Table;