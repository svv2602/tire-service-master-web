import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@mui/material';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
  overscanCount?: number;
  emptyMessage?: string;
  loading?: boolean;
}

/**
 * Компонент для виртуализации списков с большим количеством элементов
 * @param items - массив элементов для отображения
 * @param renderItem - функция рендеринга элемента
 * @param itemHeight - высота одного элемента в пикселях
 * @param className - дополнительные CSS классы
 * @param overscanCount - количество элементов для предзагрузки
 * @param emptyMessage - сообщение при пустом списке
 * @param loading - флаг загрузки
 */
function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
  overscanCount = 5,
  emptyMessage = 'Нет данных для отображения',
  loading = false
}: VirtualizedListProps<T>) {
  // Если список пуст и не в состоянии загрузки, показываем сообщение
  if (items.length === 0 && !loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        color="text.secondary"
        className={className}
        data-testid="virtualized-list-empty"
      >
        {emptyMessage}
      </Box>
    );
  }

  // Функция рендеринга строки для react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style} data-testid={`virtualized-list-item-${index}`}>
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <Box
      height="100%"
      width="100%"
      className={className}
      data-testid="virtualized-list"
    >
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            children={Row}
          />
        )}
      </AutoSizer>
    </Box>
  );
}

export default VirtualizedList; 