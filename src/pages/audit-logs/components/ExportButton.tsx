import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useLazyExportAuditLogsQuery, ExportParams } from '../../../api/auditLogs.api';

interface ExportButtonProps {
  filters: Omit<ExportParams, 'format'>;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filters, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const [triggerExport, { isLoading }] = useLazyExportAuditLogsQuery();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      handleClose();
      
      const result = await triggerExport({ ...filters, format }).unwrap();
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      link.download = `audit_logs_${today}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setNotification({
        open: true,
        message: `Файл успешно экспортирован в формате ${format.toUpperCase()}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setNotification({
        open: true,
        message: 'Ошибка при экспорте данных',
        type: 'error',
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={disabled || isLoading}
        startIcon={isLoading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
        endIcon={!isLoading && <ExpandMoreIcon />}
        sx={{
          minWidth: 140,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {isLoading ? 'Экспорт...' : 'Экспорт'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="CSV файл" 
            secondary="Для анализа в Excel/Google Sheets"
          />
        </MenuItem>
        
        <MenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Excel файл" 
            secondary="Форматированный отчет с статистикой"
          />
        </MenuItem>
      </Menu>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}; 