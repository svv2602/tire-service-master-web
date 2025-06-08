import { Theme } from '@mui/material';

/**
 * Получить стили для AppBar
 * @param theme - тема Material-UI
 */
export const getAppBarStyles = (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.background.default 
      : theme.palette.primary.main,
    boxShadow: theme.shadows[2],
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toolbar: {
    padding: theme.spacing(0, 3),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(0, 4),
    },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
});