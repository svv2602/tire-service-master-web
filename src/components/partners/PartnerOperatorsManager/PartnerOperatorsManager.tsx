import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// API хуки
import {
  useGetOperatorsByPartnerQuery,
} from '../../../api/operators.api';
import {
  useGetServicePointsByPartnerIdQuery,
} from '../../../api/servicePoints.api';

// UI компоненты
import { OperatorAssignmentModal } from '../../ui/OperatorAssignmentModal';
import { useSnackbar } from '../../ui/Snackbar/SnackbarContext';

export interface PartnerOperatorsManagerProps {
  partnerId: number;
  partnerName?: string;
  onOperatorChange?: () => void;
}

export const PartnerOperatorsManager: React.FC<PartnerOperatorsManagerProps> = ({
  partnerId,
  partnerName,
  onOperatorChange,
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

  const {
    data: servicePointsData,
    isLoading: servicePointsLoading,
  } = useGetServicePointsByPartnerIdQuery({ partner_id: partnerId });

  // Обработка данных
  const operators = operatorsData || [];
  const servicePoints = servicePointsData?.data || [];

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

  if (operatorsLoading || servicePointsLoading) {
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
            <strong>Статистика:</strong> {operators.length} операторов, {servicePoints.length} сервисных точек.
            Используйте кнопки "Управление назначениями" для настройки доступа операторов к сервисным точкам.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Операторы */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Операторы"
              subheader={`${operators.length} операторов`}
              action={
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => {/* TODO: Добавить оператора */}}
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
                      {operator.user?.email}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AssignmentIcon />}
                    onClick={() => handleOpenAssignmentModal(operator)}
                  >
                    Назначения
                  </Button>
                </Box>
              ))}
              
              {operators.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  Нет операторов
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Сервисные точки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Сервисные точки"
              subheader={`${servicePoints.length} точек`}
            />
            <CardContent>
              {servicePoints.map((point: any) => (
                <Box 
                  key={point.id}
                  py={1}
                  borderBottom="1px solid"
                  borderColor="divider"
                >
                  <Typography variant="body2" fontWeight="bold">
                    {point.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {point.address}
                  </Typography>
                </Box>
              ))}
              
              {servicePoints.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  Нет сервисных точек
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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