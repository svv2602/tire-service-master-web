import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PageHeaderConfig } from './index';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  config: PageHeaderConfig;
}

/**
 * Компонент заголовка страницы с кнопками действий
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ config }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const { title, subtitle, actions = [] } = config;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 2,
        mb: 3,
      }}
    >
      {/* Заголовок и подзаголовок */}
      <Box>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: subtitle ? 0.5 : 0
          }}
        >
          {t(title)}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {t(subtitle)}
          </Typography>
        )}
      </Box>

      {/* Кнопки действий */}
      {actions.length > 0 && (
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          sx={{ 
            width: isMobile ? '100%' : 'auto',
            mt: isMobile ? 2 : 0
          }}
        >
          {actions.map((action: any, index: number) => (
            <Button
              key={action.id || `action-${index}`}
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                minWidth: isMobile ? '100%' : 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {t(action.label)}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PageHeader; 