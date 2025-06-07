import React from 'react';
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ANIMATIONS } from '../../../styles/theme';

/** Таб */
export interface TabItem {
  /** Идентификатор таба */
  id: string;
  /** Заголовок таба */
  label: string;
  /** Иконка */
  icon?: React.ReactElement;
  /** Отключен ли таб */
  disabled?: boolean;
}

/** Пропсы табов */
export interface TabsProps extends Omit<MuiTabsProps, 'onChange' | 'value'> {
  /** Список табов */
  tabs: TabItem[];
  /** Активный таб */
  value: string;
  /** Колбэк изменения таба */
  onChange: (value: string) => void;
  /** Ориентация */
  orientation?: 'horizontal' | 'vertical';
  /** Растянуть на всю ширину */
  fullWidth?: boolean;
  /** Центрировать вкладки */
  centered?: boolean;
}

const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 0,
    padding: '12px 16px',
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(4),
    '&:hover': {
      opacity: 1,
    },
    '&.Mui-selected': {
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
  '& .MuiTabs-indicator': {
    transition: ANIMATIONS.transition.medium,
  },
}));

/**
 * Компонент табов с поддержкой ориентации
 * 
 * @example
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'Вкладка 1', icon: <HomeIcon /> },
 *     { id: 'tab2', label: 'Вкладка 2', icon: <PersonIcon /> },
 *   ]}
 *   value={activeTab}
 *   onChange={handleTabChange}
 * />
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  orientation = 'horizontal',
  fullWidth = false,
  centered = false,
  ...props
}) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <StyledTabs
        value={value}
        onChange={handleChange}
        orientation={orientation}
        variant={fullWidth ? 'fullWidth' : 'standard'}
        centered={centered}
        {...props}
      >
        {tabs.map((tab) => (
          <MuiTab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            disabled={tab.disabled}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};

export default Tabs;