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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import { LoadingState, EmptyState } from './components';

/** Колонка таблицы */
export interface Column {
  /** Идентификатор колонки */
  id: string;
  /** Заголовок колонки */
  label: string;
  /** Минимальная ширина */
  minWidth?: number;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Выравнивание */
  align?: 'left' | 'right' | 'center';
  /** Перенос по словам */
  wrap?: boolean;
  /** Показать многоточие при переполнении */
  ellipsis?: boolean;
  /** Скрыть на мобильных устройствах */
  hideOnMobile?: boolean;
  /** Зафиксировать колонку */
  sticky?: boolean;
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
  /** Показать индикатор загрузки */
  loading?: boolean;
  /** Компонент для пустого состояния */
  empty?: React.ReactNode;
  /** Адаптивная таблица */
  responsive?: boolean;
  /** Обработчик клика по строке */
  onRowClick?: (row: any, index: number) => void;
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
  shouldForwardProp: (prop) => !['wrap', 'ellipsis', 'maxWidth', 'sticky', 'hideOnMobile'].includes(prop as string),
})<{ 
  wrap?: boolean; 
  ellipsis?: boolean; 
  maxWidth?: number;
  sticky?: boolean;
  hideOnMobile?: boolean;
}>(({ theme, wrap, ellipsis, maxWidth, sticky, hideOnMobile }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
    color: themeColors.textPrimary,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    transition: tokens.transitions.duration.normal,
    // Максимальная ширина
    ...(maxWidth && { maxWidth: `${maxWidth}px` }),
    // Фиксированная колонка
    ...(sticky && {
      position: 'sticky',
      left: 0,
      backgroundColor: themeColors.backgroundCard,
      zIndex: 1,
    }),
    // Скрытие на мобильных
    ...(hideOnMobile && {
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    }),
    // Стили переноса слов
    ...(wrap ? {
      whiteSpace: 'normal',
      wordBreak: 'normal', // Исправлено: убрано побуквенное разбиение
      overflowWrap: 'anywhere', // Исправлено: правильный перенос длинных слов
      hyphens: 'auto',
      wordWrap: 'break-word', // Для старых браузеров
    } : ellipsis ? {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    } : {
      whiteSpace: 'nowrap',
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
    position: 'relative',
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
  loading = false,
  empty,
  responsive = true,
  onRowClick,
  getRowProps,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Фильтруем колонки для мобильных устройств
  const visibleColumns = responsive && isMobile 
    ? columns.filter(col => !col.hideOnMobile)
    : columns;

  const renderTableBody = () => {
    // Состояние загрузки
    if (loading) {
      return <LoadingState columns={visibleColumns} />;
    }
    
    // Пустое состояние
    if (rows.length === 0) {
      return empty ? (
        <TableBody>
          <TableRow>
            <TableCell colSpan={visibleColumns.length} sx={{ border: 'none', p: 0 }}>
              {empty}
            </TableCell>
          </TableRow>
        </TableBody>
      ) : (
        <EmptyState columns={visibleColumns} />
      );
    }

    // Обычные данные
    return (
      <TableBody>
        {rows.map((row, index) => {
          const rowProps = getRowProps ? getRowProps(row, index) : {};
          const handleRowClick = onRowClick ? () => onRowClick(row, index) : undefined;
          
          return (
            <StyledTableRow 
              hover 
              role="checkbox" 
              tabIndex={-1} 
              key={index}
              onClick={handleRowClick}
              sx={{ 
                cursor: onRowClick ? 'pointer' : 'default',
                ...rowProps.sx 
              }}
              {...rowProps}
            >
              {visibleColumns.map((column) => {
                const value = row[column.id];
                return (
                  <StyledTableCell 
                    key={column.id} 
                    align={column.align}
                    wrap={column.wrap}
                    ellipsis={column.ellipsis}
                    maxWidth={column.maxWidth}
                    sticky={column.sticky}
                    hideOnMobile={column.hideOnMobile}
                    style={{ 
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth 
                    }}
                  >
                    {column.format ? column.format(value, row) : value}
                  </StyledTableCell>
                );
              })}
            </StyledTableRow>
          );
        })}
      </TableBody>
    );
  };

  return (
    <StyledPaper>
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} {...props}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <StyledHeaderCell
                  key={column.id}
                  align={column.align}
                  sticky={column.sticky}
                  hideOnMobile={column.hideOnMobile}
                  style={{ 
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth 
                  }}
                >
                  {column.label}
                </StyledHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          {renderTableBody()}
        </MuiTable>
      </TableContainer>
    </StyledPaper>
  );
};

export default Table;