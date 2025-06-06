// styles/components/tabStyles.ts
import { Theme, SxProps } from '@mui/material';
import { SIZES, ANIMATIONS } from '../theme';

export const getTabStyles = (theme: Theme): SxProps<Theme> => ({
  tab: {
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: SIZES.fontSize.md,
    transition: ANIMATIONS.transition.fast,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  tabPanel: {
    padding: theme.spacing(SIZES.spacing.lg),
  },
  tabList: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  indicator: {
    height: 3,
    borderRadius: SIZES.borderRadius.sm,
  }
});
