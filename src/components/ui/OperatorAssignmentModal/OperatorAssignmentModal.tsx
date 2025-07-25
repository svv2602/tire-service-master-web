import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';

export interface Operator {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
  };
  partner_id?: number;
  partner_name?: string;
  access_level?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface OperatorAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  operator: Operator | null;
  onAssignmentSuccess?: () => void;
}

export const OperatorAssignmentModal: React.FC<OperatorAssignmentModalProps> = ({
  open,
  onClose,
  operator,
  onAssignmentSuccess,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Управление назначениями оператора
      </DialogTitle>
      
      <DialogContent>
        {operator && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {operator.user.first_name} {operator.user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {operator.user.email}
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Функция управления назначениями находится в разработке.
              Пока используйте административную панель для настройки назначений операторов.
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 