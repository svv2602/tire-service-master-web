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
  Chip,
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
  useGetOperatorServicePointsQuery,
} from '../../../api/operators.api';

// UI компоненты
import { OperatorAssignmentModal } from '../../ui/OperatorAssignmentModal';
import { useSnackbar } from '../../ui/Snackbar/SnackbarContext';
import { ActionsMenu, ActionItem } from '../../ui/ActionsMenu/ActionsMenu';

export interface PartnerOperatorsManagerProps {
  partnerId: number;
  partnerName?: string;
  onOperatorChange?: () => void;
  onAddOperator?: () => void;
  onEditOperator?: (operator: any) => void;
  onDeleteOperator?: (operator: any) => void;
}

// Компонент для отображения статистики назначений оператора
interface OperatorAssignmentStatsProps {
  operatorId: number;
}

const OperatorAssignmentStats: React.FC<OperatorAssignmentStatsProps> = ({ operatorId }) => {
  const { data: assignmentsData, isLoading } = useGetOperatorServicePointsQuery({ 
    operatorId,
    active: true // Показываем только активные назначения
  });

  if (isLoading) {
    return <Chip label="..." size="small" variant="outlined" />;
  }

  const count = assignmentsData?.meta?.active || 0;
  
  return (
    <Chip 
      label={`${count} точек`}
      size="small" 
      variant="outlined"
      color={count > 0 ? 'primary' : 'default'}
    />
  );
};

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

  // Конфигурация действий для каждого оператора
  const getOperatorActions = (operator: any): ActionItem<any>[] => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: () => onEditOperator?.(operator),
      color: 'primary',
      tooltip: 'Редактировать данные оператора',
      isVisible: () => !!onEditOperator,
    },
    {
      id: 'assignments',
      label: 'Назначения',
      icon: <AssignmentIcon />,
      onClick: () => handleOpenAssignmentModal(operator),
      color: 'info',
      tooltip: 'Управление назначениями на сервисные точки',
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: () => onDeleteOperator?.(operator),
      color: 'error',
      tooltip: 'Удалить оператора',
      isVisible: () => !!onDeleteOperator,
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: `Вы действительно хотите удалить оператора ${operator.user?.first_name} ${operator.user?.last_name}?`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      },
    },
  ];

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
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="body2" fontWeight="bold">
                    {operator.user?.first_name} {operator.user?.last_name}
                  </Typography>
                  <OperatorAssignmentStats operatorId={operator.id} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {operator.user?.email} • {operator.position}
                </Typography>
              </Box>
              <ActionsMenu 
                actions={getOperatorActions(operator)}
                item={operator}
              />
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