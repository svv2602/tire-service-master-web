import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';

// Импортируем API хуки
import {
  useGetOperatorServicePointsQuery,
  useAssignOperatorToPointMutation,
  useUnassignOperatorFromPointMutation,
  useBulkAssignOperatorMutation,
} from '../../../api/operators.api';
import { useGetServicePointsByPartnerIdQuery } from '../../../api/servicePoints.api';

export interface Operator {
  id: number;
  partner_id: number;
  partner_name?: string;
  position?: string;
  access_level: number;
  is_active: boolean;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    phone?: string;
    is_active: boolean;
  };
  service_point_ids?: number[];
  created_at?: string;
  updated_at?: string;
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
  const [selectedServicePoints, setSelectedServicePoints] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API хуки
  const { data: currentAssignments, refetch: refetchAssignments } = useGetOperatorServicePointsQuery(
    { operatorId: operator?.id || 0 },
    { skip: !operator?.id }
  );

  const { data: servicePointsData } = useGetServicePointsByPartnerIdQuery(
    { partner_id: operator?.partner_id || 0 },
    { skip: !operator?.partner_id }
  );

  const [assignOperator] = useAssignOperatorToPointMutation();
  const [unassignOperator] = useUnassignOperatorFromPointMutation();
  const [bulkAssignOperator] = useBulkAssignOperatorMutation();

  // Получаем текущие назначения при открытии модального окна
  useEffect(() => {
    if (operator && currentAssignments?.data) {
      const assignedIds = currentAssignments.data
        .filter(assignment => assignment.is_active)
        .map(assignment => assignment.service_point_id);
      setSelectedServicePoints(assignedIds);
    }
  }, [operator, currentAssignments]);

  // Сбрасываем сообщения при открытии
  useEffect(() => {
    if (open) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [open]);

  const servicePoints = servicePointsData?.data || [];

  const handleServicePointToggle = (servicePointId: number) => {
    setSelectedServicePoints(prev => {
      if (prev.includes(servicePointId)) {
        return prev.filter(id => id !== servicePointId);
      } else {
        return [...prev, servicePointId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    if (!operator) return;

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      // Получаем текущие активные назначения
      const currentActiveIds = currentAssignments?.data
        ?.filter(assignment => assignment.is_active)
        ?.map(assignment => assignment.service_point_id) || [];

      // Определяем, что нужно добавить и что убрать
      const toAssign = selectedServicePoints.filter(id => !currentActiveIds.includes(id));
      const toUnassign = currentActiveIds.filter(id => !selectedServicePoints.includes(id));

      // Убираем назначения
      for (const servicePointId of toUnassign) {
        const assignment = currentAssignments?.data?.find(
          a => a.service_point_id === servicePointId && a.is_active
        );
        if (assignment) {
          await unassignOperator(assignment.id).unwrap();
        }
      }

      // Добавляем новые назначения
      if (toAssign.length > 0) {
        await bulkAssignOperator({
          operatorId: operator.id,
          data: { service_point_ids: toAssign }
        }).unwrap();
      }

      await refetchAssignments();
      onAssignmentSuccess?.();
      setSuccessMessage('Назначения успешно обновлены');

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Ошибка при обновлении назначений:', error);
      setErrorMessage(
        error.data?.message || 
        error.message || 
        'Произошла ошибка при обновлении назначений'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!operator) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Управление назначениями оператора
      </DialogTitle>
      
      <DialogContent>
        <Box>
          <Typography variant="h6" gutterBottom>
            {operator.user.first_name} {operator.user.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {operator.user.email}
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
            Выберите сервисные точки для назначения:
          </Typography>

          {servicePoints.length === 0 ? (
            <Alert severity="info">
              У партнера нет сервисных точек для назначения
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {servicePoints.map((servicePoint) => (
                <Grid item xs={12} sm={6} key={servicePoint.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServicePoints.includes(servicePoint.id)}
                            onChange={() => handleServicePointToggle(servicePoint.id)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {servicePoint.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {servicePoint.address}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={servicePoint.work_status === 'working' ? 'Работает' : 'Не работает'}
                                size="small"
                                color={servicePoint.work_status === 'working' ? 'success' : 'warning'}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSaveAssignments} 
          variant="contained" 
          disabled={loading || servicePoints.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Сохранение...' : 'Сохранить назначения'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 