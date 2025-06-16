import { styled } from '@mui/material/styles';
import { AppBar as MuiAppBar, Toolbar, Typography } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Стилизованный заголовок
 */
export const StyledTitle = styled(Typography)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeights.medium,
    color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
  };
});

/**
 * Стилизованный AppBar
 */
export const StyledAppBar = styled(MuiAppBar)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: theme.palette.mode === 'dark' 
      ? themeColors.backgroundSecondary 
      : tokens.colors.primary.main,
    boxShadow: tokens.shadows.md,
    zIndex: theme.zIndex.drawer + 1,
    transition: tokens.transitions.duration.normal,
  };
});

/**
 * Стилизованный Toolbar
 */
export const StyledToolbar = styled(Toolbar)(({ theme }) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    
    [theme.breakpoints.up('md')]: {
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    },
  };
});