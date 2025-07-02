import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Table } from '../../ui/Table/Table';
import { Pagination } from '../../ui/Pagination/Pagination';
import { PageHeader } from './PageHeader';
import { SearchAndFilters } from './SearchAndFilters';
import { RowActions } from './RowActions';
import { PageTableProps, Column as PageTableColumn } from './index';
import { getTablePageStyles } from '../../../styles/components';
import { useTheme } from '@mui/material/styles';

/**
 * Универсальный компонент таблицы для страниц админки
 */
export const PageTable = <T,>({
  header,
  search,
  filters = [],
  customContent,
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

  // Преобразуем колонки PageTable в формат для Table компонента
  const enhancedColumns = useMemo(() => {
    const tableColumns = columns.map((col: PageTableColumn<T>) => ({
      id: col.id,
      label: col.label,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      align: col.align,
      sortable: col.sortable,
      hideOnMobile: col.hideOnMobile,
      wrap: col.wrap,
      format: col.format || col.render ? (value: any, row: T, index?: number) => {
        if (col.format) {
          return col.format(value, row, index);
        }
        if (col.render) {
          return col.render(row, index);
        }
        return value;
      } : undefined,
    }));

    // Добавляем колонку действий если есть действия
    if (actions.length > 0) {
      const actionsColumn = {
        id: 'actions',
        label: 'Действия',
        minWidth: 120,
        maxWidth: 150,
        align: 'center' as const,
        sortable: false,
        hideOnMobile: false,
        wrap: false,
        format: (_: any, row: T, index?: number) => (
          <RowActions 
            actions={actions} 
            row={row} 
            index={index || 0} 
          />
        ),
      };
      tableColumns.push(actionsColumn);
    }

    return tableColumns;
  }, [columns, actions]);



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
      />

      {/* Кастомный контент */}
      {customContent && (
        <Box sx={{ mb: 2 }}>
          {customContent}
        </Box>
      )}

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