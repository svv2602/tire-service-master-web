import React from 'react';
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  TabProps as MuiTabProps,
  Box,
  styled
} from '@mui/material';

/** Пропсы для Tab */
export interface TabProps extends Omit<MuiTabProps, 'value'> {
  /** Текст вкладки */
  label: string;
  /** Иконка вкладки */
  icon?: React.ReactElement;
  /** Значение вкладки */
  value?: string | number;
  /** Отключена ли вкладка */
  disabled?: boolean;
}

/** Пропсы для Tabs */
export interface TabsProps extends Omit<MuiTabsProps, 'children' | 'onChange'> {
  /** Текущее значение */
  value: string | number;
  /** Колбэк изменения вкладки */
  onChange: (value: string | number, event?: React.SyntheticEvent) => void;
  /** Список вкладок */
  tabs: TabProps[];
  /** Вариант отображения */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** Ориентация */
  orientation?: 'horizontal' | 'vertical';
  /** Размер */
  size?: 'small' | 'medium' | 'large';
}

/** Стилизованные вкладки */
const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
  },
}));

/** Стилизованная вкладка */
const StyledTab = styled(MuiTab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  minHeight: 48,
  padding: theme.spacing(1, 2),
  transition: theme.transitions.create(['color', 'background-color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));

/** Панель контента для вкладки */
interface TabPanelProps {
  children?: React.ReactNode;
  index: string | number;
  value: string | number;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Компонент вкладок
 * 
 * @example
 * <Tabs
 *   value={activeTab}
 *   onChange={handleTabChange}
 *   tabs={[
 *     { label: 'Общие', value: 0, icon: <SettingsIcon /> },
 *     { label: 'Уведомления', value: 1, icon: <NotificationsIcon /> }
 *   ]}
 * />
 */
export const Tabs: React.FC<TabsProps> = ({
  value,
  onChange,
  tabs,
  variant = 'standard',
  orientation = 'horizontal',
  size = 'medium',
  ...props
}) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string | number) => {
    onChange(newValue, event);
  };

  return (
    <StyledTabs
      value={value}
      onChange={handleChange}
      variant={variant === 'scrollable' ? 'scrollable' : variant === 'fullWidth' ? 'fullWidth' : 'standard'}
      orientation={orientation}
      scrollButtons={variant === 'scrollable' ? 'auto' : false}
      allowScrollButtonsMobile={variant === 'scrollable'}
      sx={{
        borderBottom: orientation === 'horizontal' ? 1 : 0,
        borderRight: orientation === 'vertical' ? 1 : 0,
        borderColor: 'divider',
        minHeight: size === 'small' ? 40 : size === 'large' ? 56 : 48,
      }}
      {...props}
    >
      {tabs.map((tab, index) => {
        const { label, icon, value, disabled, ...tabProps } = tab;
        return (
          <StyledTab
            key={value ?? index}
            label={label}
            icon={icon}
            value={value ?? index}
            disabled={disabled}
            id={`tab-${value ?? index}`}
            aria-controls={`tabpanel-${value ?? index}`}
            {...tabProps}
          />
        );
      })}
    </StyledTabs>
  );
};

export default Tabs;