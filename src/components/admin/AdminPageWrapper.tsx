import React from 'react';
import { Container } from '@mui/material';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ 
  children, 
  maxWidth = 'xl' 
}) => {
  return (
    <Container maxWidth={maxWidth} sx={{ p: 3, flex: 1, boxSizing: 'border-box' }}>
      {children}
    </Container>
  );
};

export default AdminPageWrapper;