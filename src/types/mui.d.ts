import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }

  interface Palette {
    neutral?: Palette['primary'];
  }
  
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }

  interface TypeBackground {
    card?: string;
    tableHeader?: string;
    field?: string;
    hover?: string;
    error?: string;
    table?: string;
    tableRow?: string;
  }

  interface TypeText {
    muted?: string;
  }
}

// Расширение для компонента Button
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

// Расширение для компонента Modal
declare module '@mui/material/Modal' {
  interface ModalProps {
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false | number | string;
    keepMounted?: boolean;
  }
}

// Расширение для компонента Menu
declare module '@mui/material/Menu' {
  interface MenuProps {
    onClick?: React.MouseEventHandler<HTMLElement>;
    id?: string;
    keepMounted?: boolean;
  }
}

// Расширение для компонента Progress
declare module '@mui/material/LinearProgress' {
  interface LinearProgressProps {
    showValue?: boolean;
  }
}

// Расширение для компонента Skeleton
declare module '@mui/material/Skeleton' {
  interface SkeletonProps {
    borderRadius?: number | string;
  }
}

// Расширение для компонента IconButton
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true;
  }
}