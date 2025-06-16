import React from 'react';
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  TabProps as MuiTabProps,
  Box,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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
const StyledTabs = styled(MuiTabs)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiTabs-indicator': {
      height: 3,
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: themeColors.primary,
      transition: tokens.transitions.duration.normal,
    },
    '& .MuiTabs-flexContainer': {
      gap: tokens.spacing.sm,
    },
    borderColor: themeColors.borderPrimary,
  };
});

/** Стилизованная вкладка */
const StyledTab = styled(MuiTab)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    textTransform: 'none',
    fontWeight: tokens.typography.fontWeights.medium,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    minHeight: 48,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    transition: tokens.transitions.duration.normal,
    color: themeColors.textSecondary,
    
    '&:hover': {
      backgroundColor: themeColors.backgroundHover,
      borderRadius: tokens.borderRadius.sm,
      color: themeColors.textPrimary,
    },
    
    '&.Mui-selected': {
      color: themeColors.primary,
      fontWeight: tokens.typography.fontWeights.bold,
    },
    
    '&.Mui-disabled': {
      opacity: 0.5,
      color: themeColors.textSecondary,
    },
  };
});

/** Стилизованная панель контента для вкладки */
const StyledTabPanel = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.md} 0`,
    color: themeColors.textPrimary,
  };
});

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
      {value === index && <StyledTabPanel>{children}</StyledTabPanel>}
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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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