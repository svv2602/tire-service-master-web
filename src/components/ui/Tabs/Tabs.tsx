import React from 'react';
import { Tabs as MuiTabs, Tab as MuiTab, Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TabsProps } from './types';

// Стилизованные компоненты
const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.primary.main 
      : theme.palette.primary.main,
    height: 3,
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}));

const StyledTab = styled(MuiTab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.mode === 'dark' 
      ? theme.palette.primary.main 
      : theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Компонент панели с содержимым таба
const TabPanel = (props: {
  children?: React.ReactNode;
  id: string;
  value: number;
  index: number;
}) => {
  const { children, value, index, id, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
};

/**
 * Унифицированный компонент вкладок
 * @param {TabsProps} props - Свойства компонента
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  variant = 'standard',
  orientation = 'horizontal',
  centered = false,
  scrollButtons = 'auto',
  allowScrollButtonsMobile = false,
  sx,
}) => {
  const theme = useTheme();

  const a11yProps = (id: string) => ({
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs
          value={value}
          onChange={onChange}
          variant={variant}
          orientation={orientation}
          centered={centered}
          scrollButtons={scrollButtons}
          allowScrollButtonsMobile={allowScrollButtonsMobile}
          aria-label="Вкладки навигации"
        >
          {tabs.map((tab, index) => (
            <StyledTab
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition={tab.iconPosition}
              disabled={tab.disabled}
              {...a11yProps(tab.id)}
            />
          ))}
        </StyledTabs>
      </Box>
      {tabs.map((tab, index) => (
        <TabPanel 
          key={tab.id} 
          value={value} 
          index={index}
          id={tab.id}
        >
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};