import { Theme } from '@mui/material/styles';

export const getTablePageStyles = (theme: Theme) => ({
  pageContainer: {
    padding: theme.spacing(1, 2),
    maxWidth: '100%',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap' as const,
    gap: theme.spacing(2),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  titleIcon: {
    fontSize: '2rem',
    color: theme.palette.primary.main,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  subtitle: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  filtersContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  tableContainer: {
    marginBottom: theme.spacing(3),
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
}); 