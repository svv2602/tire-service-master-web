import { Theme } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Получить стили для AppBar
 * @param theme - тема Material-UI
 */
export const getAppBarStyles = (theme: Theme) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    root: {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary
        : themeColors.primary,
      boxShadow: tokens.shadows.md,
      transition: tokens.transitions.duration.normal,
      borderBottom: `1px solid ${themeColors.borderPrimary}`,
    },
    toolbar: {
      padding: `${tokens.spacing.xs} ${tokens.spacing.lg}`,
      [theme.breakpoints.up('sm')]: {
        padding: `${tokens.spacing.xs} ${tokens.spacing.xl}`,
      },
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '64px',
    },
    title: {
      flexGrow: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.medium,
      color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
    },
    menuButton: {
      color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
      marginRight: tokens.spacing.md,
      padding: tokens.spacing.xs,
      transition: tokens.transitions.duration.normal,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
      },
    },
    actions: {
      marginLeft: tokens.spacing.md,
    },
  };
};