import React from 'react';
import { Select, MenuItem, FormControl, Box, IconButton, Menu } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';

export const LanguageSelector: React.FC = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
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
    return currentLanguage === 'uk' ? 'УК' : 'РУ';
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          color: 'inherit',
          border: '1px solid rgba(255, 255, 255, 0.23)',
          borderRadius: 1,
          px: 1,
          minWidth: 50,
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }
        }}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <LanguageIcon sx={{ fontSize: 18, mr: 0.5 }} />
        <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
          {getCurrentLanguageLabel()}
        </Box>
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('uk')}
          selected={currentLanguage === 'uk'}
        >
          🇺🇦 {t('language.uk')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ru')}
          selected={currentLanguage === 'ru'}
        >
          🇷🇺 {t('language.ru')}
        </MenuItem>
      </Menu>
    </Box>
  );
}; 