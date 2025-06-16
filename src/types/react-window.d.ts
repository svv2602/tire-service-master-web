declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
    data?: any;
  }

  export interface FixedSizeListProps {
    children: React.ComponentType<ListChildComponentProps>;
    className?: string;
    height: number | string;
    itemCount: number;
    itemSize: number;
    width: number | string;
    itemData?: any;
    style?: React.CSSProperties;
    useIsScrolling?: boolean;
    direction?: 'ltr' | 'rtl';
    layout?: 'horizontal' | 'vertical';
    overscanCount?: number;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
  }

  export interface VariableSizeListProps extends Omit<FixedSizeListProps, 'itemSize'> {
    itemSize: (index: number) => number;
  }

  export class VariableSizeList extends React.Component<VariableSizeListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
  }
}

declare module 'react-virtualized-auto-sizer' {
  import * as React from 'react';

  interface AutoSizerProps {
    children: (size: { height: number; width: number }) => React.ReactNode;
    className?: string;
    defaultHeight?: number;
    defaultWidth?: number;
    disableHeight?: boolean;
    disableWidth?: boolean;
    onResize?: (size: { height: number; width: number }) => void;
    style?: React.CSSProperties;
  }

  export default class AutoSizer extends React.Component<AutoSizerProps> {}
}