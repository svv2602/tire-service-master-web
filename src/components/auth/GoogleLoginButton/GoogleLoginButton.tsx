import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#757575',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
  },
  '&:active': {
    backgroundColor: '#f1f3f4',
  },
  '&:disabled': {
    backgroundColor: '#f8f9fa',
    color: '#bdc1c6',
    cursor: 'not-allowed',
  },
}));

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.6 10.2273C19.6 9.51819 19.5364 8.83637 19.4182 8.18182H10V12.0455H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273Z"
      fill="#4285F4"
    />
    <path
      d="M10 20C12.7 20 14.9636 19.1045 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z"
      fill="#34A853"
    />
    <path
      d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z"
      fill="#FBBC04"
    />
    <path
      d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
      fill="#EA4335"
    />
  </svg>
);

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: 'signin' | 'signup' | 'continue';
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  variant = 'signin'
}) => {
  const { t } = useTranslation();
  
  const getButtonText = () => {
    switch (variant) {
      case 'signup':
        return t('auth.google.signUp');
      case 'continue':
        return t('auth.google.continue');
      default:
        return t('auth.google.signIn');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Перенаправляем на OAuth endpoint
      window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/google`;
    }
  };

  return (
    <GoogleButton
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      variant="outlined"
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('common.loading')}
          </Typography>
        </Box>
      ) : (
        <>
          <GoogleIcon />
          <Typography variant="body2" color="text.primary">
            {getButtonText()}
          </Typography>
        </>
      )}
    </GoogleButton>
  );
};

export default GoogleLoginButton; 