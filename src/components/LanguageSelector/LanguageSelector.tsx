import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip, useTheme } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { tokens } from '../../styles/theme/tokens';

export const LanguageSelector: React.FC = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    handleClose();
  };

  const getCurrentLanguageLabel = () => {
    return currentLanguage === 'uk' ? 'UA' : 'RU';
  };

  return (
    <>
      <Tooltip title={t('language.switchLanguage')}>
        <IconButton
          onClick={handleClick}
          sx={{
            ml: 1,
            color: theme.palette.mode === 'dark' ? '#fff' : '#0d2345',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : '#fff',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1.5px solid #1976d2',
            transition: tokens.transitions.duration.normal,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            minWidth: 'auto',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : '#e3f0ff',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : '#1565c0',
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          aria-label={t('language.switchLanguage')}
        >
          {getCurrentLanguageLabel()}
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('uk')}
          selected={currentLanguage === 'uk'}
        >
          {t('language.uk')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ru')}
          selected={currentLanguage === 'ru'}
        >
          {t('language.ru')}
        </MenuItem>
      </Menu>
    </>
  );
}; 