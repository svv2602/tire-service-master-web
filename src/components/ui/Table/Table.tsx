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
  styled,
  useTheme
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
  /** Форматирование значения */
  format?: (value: any) => string | React.ReactNode;
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

const StyledTableCell = styled(TableCell)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
    color: themeColors.textPrimary,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    transition: tokens.transitions.duration.normal,
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
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

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
            {rows.map((row, index) => (
              <StyledTableRow hover role="checkbox" tabIndex={-1} key={index}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <StyledTableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value) : value}
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </StyledPaper>
  );
};

export default Table;