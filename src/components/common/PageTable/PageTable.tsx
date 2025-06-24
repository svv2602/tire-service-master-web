import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Table } from '../../ui/Table/Table';
import { Pagination } from '../../ui/Pagination/Pagination';
import { PageHeader } from './PageHeader';
import { SearchAndFilters } from './SearchAndFilters';
import { RowActions } from './RowActions';
import { PageTableProps } from './types';
import { getTablePageStyles } from '../../../styles/components';
import { useTheme } from '@mui/material/styles';

/**
 * Универсальный компонент таблицы для страниц админки
 */
export const PageTable = <T,>({
  header,
  search,
  filters = [],
  columns,
  rows,
  actions = [],
  loading = false,
  empty,
  responsive = true,
  onRowClick,
  pagination,
  tableProps = {},
}: PageTableProps<T>) => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Добавляем колонку действий если есть действия
  const enhancedColumns = useMemo(() => {
    if (actions.length === 0) return columns;

    const actionsColumn = {
      id: 'actions',
      label: 'Действия',
      minWidth: 120,
      maxWidth: 150,
      align: 'center' as const,
      format: (_: any, row: T, index?: number) => (
        <RowActions 
          actions={actions} 
          row={row} 
          index={index || 0} 
        />
      ),
    };

    return [...columns, actionsColumn];
  }, [columns, actions]);

  // Обработчик очистки фильтров
  const handleClearFilters = () => {
    filters.forEach(filter => {
      if (Array.isArray(filter.value)) {
        filter.onChange([]);
      } else {
        filter.onChange('');
      }
    });
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      {header && (
        <PageHeader config={header} />
      )}

      {/* Поиск и фильтры */}
      <SearchAndFilters
        search={search}
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* Таблица */}
      <Table
        columns={enhancedColumns}
        rows={rows}
        loading={loading}
        empty={empty}
        responsive={responsive}
        onRowClick={onRowClick}
        stickyHeader
        {...tableProps}
      />

      {/* Пагинация */}
      {pagination && rows.length > 0 && !loading && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(pagination.totalItems / pagination.rowsPerPage)}
            page={pagination.page + 1}
            onChange={(newPage) => pagination.onPageChange(newPage - 1)}
            disabled={loading}
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default PageTable; 