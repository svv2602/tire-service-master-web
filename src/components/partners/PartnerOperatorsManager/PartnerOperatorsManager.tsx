import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// API хуки
import {
  useGetOperatorsByPartnerQuery,
} from '../../../api/operators.api';

// UI компоненты
import { OperatorAssignmentModal } from '../../ui/OperatorAssignmentModal';
import { useSnackbar } from '../../ui/Snackbar/SnackbarContext';

export interface PartnerOperatorsManagerProps {
  partnerId: number;
  partnerName?: string;
  onOperatorChange?: () => void;
  onAddOperator?: () => void;
  onEditOperator?: (operator: any) => void;
  onDeleteOperator?: (operator: any) => void;
}

export const PartnerOperatorsManager: React.FC<PartnerOperatorsManagerProps> = ({
  partnerId,
  partnerName,
  onOperatorChange,
  onAddOperator,
  onEditOperator,
  onDeleteOperator,
}) => {
  const { showSuccess } = useSnackbar();

  // Состояние
  const [assignmentModal, setAssignmentModal] = useState<{
    open: boolean;
    operator: any | null;
  }>({
    open: false,
    operator: null,
  });

  // API запросы
  const {
    data: operatorsData,
    isLoading: operatorsLoading,
    refetch: refetchOperators,
  } = useGetOperatorsByPartnerQuery(partnerId);

  // Обработка данных
  const operators = operatorsData || [];

  // Обработчики
  const handleOpenAssignmentModal = (operator: any) => {
    setAssignmentModal({
      open: true,
      operator,
    });
  };

  const handleCloseAssignmentModal = () => {
    setAssignmentModal({
      open: false,
      operator: null,
    });
  };

  const handleAssignmentSuccess = () => {
    refetchOperators();
    onOperatorChange?.();
    showSuccess('Назначения успешно обновлены');
  };

  if (operatorsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Управление операторами партнера {partnerName}
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Статистика:</strong> {operators.length} операторов.
            Используйте кнопки "Редактировать" для изменения данных операторов и "Назначения" для настройки доступа к сервисным точкам.
          </Typography>
        </Alert>
      </Box>

      {/* Операторы */}
      <Card>
        <CardHeader
          title="Операторы"
          subheader={`${operators.length} операторов`}
          action={
            <Button
              startIcon={<AddIcon />}
              size="small"
              onClick={onAddOperator}
              disabled={!onAddOperator}
            >
              Добавить
            </Button>
          }
        />
        <CardContent>
          {operators.map((operator: any) => (
            <Box 
              key={operator.id} 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              py={1}
              borderBottom="1px solid"
              borderColor="divider"
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {operator.user?.first_name} {operator.user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {operator.user?.email} • {operator.position}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEditOperator?.(operator)}
                  disabled={!onEditOperator}
                >
                  Редактировать
                </Button>
                <Button
                  size="small"
                  startIcon={<AssignmentIcon />}
                  onClick={() => handleOpenAssignmentModal(operator)}
                >
                  Назначения
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDeleteOperator?.(operator)}
                  disabled={!onDeleteOperator}
                  color="error"
                >
                  Удалить
                </Button>
              </Box>
            </Box>
          ))}
          
          {operators.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              Нет операторов
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно управления назначениями */}
      <OperatorAssignmentModal
        open={assignmentModal.open}
        onClose={handleCloseAssignmentModal}
        operator={assignmentModal.operator}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </Box>
  );
}; 