import { Theme } from '@mui/material/styles';

export const getAuthStyles = (theme: Theme) => ({
  authCard: {
    p: 4,
    width: '100%',
    maxWidth: 400,
    mx: 'auto',
    mt: 8,
    mb: 4,
    borderRadius: 2,
    boxShadow: theme.shadows[3]
  },
  authHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 3
  },
  authIcon: {
    width: 40,
    height: 40,
    mb: 2
  },
  authField: {
    mb: 2
  },
  alert: {
    mb: 2
  },
  authSubmit: {
    mt: 2,
    mb: 2,
    height: 48
  },
  authActions: {
    mt: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  skipButton: {
    mt: 1
  }
}); 