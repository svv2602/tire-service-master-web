import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { getThemeColors } from '../../styles';
import { useTheme } from '@mui/material/styles';

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

/**
 * Компонент для отображения заголовка страницы и хлебных крошек
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, action }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: breadcrumbs ? 1 : 0 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          {title}
        </Typography>
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mt: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography key={index} sx={{ color: colors.textPrimary }}>
                {item.label}
              </Typography>
            ) : (
              <Link 
                key={index} 
                to={item.link} 
                style={{ 
                  color: colors.textSecondary, 
                  textDecoration: 'none' 
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
};

export default PageHeader; 