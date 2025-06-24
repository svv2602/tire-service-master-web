import React from 'react';
import { 
  TableBody, 
  TableRow, 
  TableCell, 
  Box, 
  Typography,
  Button
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Column } from '../Table';

interface EmptyStateProps {
  columns: Column[];
  message?: string;
  icon?: React.ReactNode;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

/**
 * Компонент для отображения пустого состояния таблицы
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  columns,
  message = 'Нет данных для отображения',
  icon = <InboxIcon sx={{ fontSize: 48, color: 'text.secondary' }} />,
  showRefresh = false,
  onRefresh
}) => {
  return (
    <TableBody>
      <TableRow>
        <TableCell 
          colSpan={columns.length} 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            border: 'none'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2
            }}
          >
            {icon}
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: showRefresh ? 1 : 0 }}
            >
              {message}
            </Typography>
            {showRefresh && onRefresh && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                size="small"
              >
                Обновить
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default EmptyState; 