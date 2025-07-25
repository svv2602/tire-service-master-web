import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as OperatorIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { ServicePointSelector, type ServicePoint } from '../ServicePointSelector';
import { useUserRole } from '../../../hooks/useUserRole';
import {
  useGetOperatorServicePointsQuery,
  useAssignOperatorToPointMutation,
  useBulkAssignOperatorMutation,
  useUnassignOperatorFromPointMutation,
} from '../../../api/operators.api';
import { useGetServicePointsQuery } from '../../../api/servicePoints.api';
import { useNotification } from '../../../hooks/useNotification';

export interface Operator {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  partner_id: number;
  partner_name?: string;
  access_level: number;
  is_active: boolean;
  created_at: string;
}

export interface OperatorAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  operator: Operator | null;
  onAssignmentSuccess?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

export const OperatorAssignmentModal: React.FC<OperatorAssignmentModalProps> = ({
  open,
  onClose,
  operator,
  onAssignmentSuccess,
}) => {
  const permissions = useUserRole();
  const { showSuccess, showError } = useNotification();
  
  // Состояние
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API запросы
  const { 
    data: assignmentsData, 
    isLoading: assignmentsLoading,
    refetch: refetchAssignments 
  } = useGetOperatorServicePointsQuery(
    { operatorId: operator?.id || 0 },
    { skip: !operator?.id }
  );

  const { 
    data: servicePointsData, 
    isLoading: servicePointsLoading 
  } = useGetServicePointsQuery({});

  // Мутации
  const [assignOperator] = useAssignOperatorToPointMutation();
  const [bulkAssignOperator] = useBulkAssignOperatorMutation();
  const [unassignOperator] = useUnassignOperatorFromPointMutation();

  // Обработка данных
  const currentAssignments = useMemo(() => {
    return assignmentsData?.data || [];
  }, [assignmentsData]);

  const assignedPointIds = useMemo(() => {
    return currentAssignments
      .filter(assignment => assignment.is_active)
      .map(assignment => assignment.service_point.id);
  }, [currentAssignments]);

  const availableServicePoints = useMemo(() => {
    if (!servicePointsData?.data) return [];
    
    // Фильтруем точки по партнеру если пользователь - партнер
    let points = servicePointsData.data;
    
    if (permissions.isPartner && permissions.partnerId) {
      points = points.filter(point => point.partner_id === permissions.partnerId);
    }
    
    // Фильтруем по партнеру оператора
    if (operator?.partner_id) {
      points = points.filter(point => point.partner_id === operator.partner_id);
    }

    return points.map(point => ({
      id: point.id,
      name: point.name,
      address: point.address,
      phone: point.phone,
      is_active: point.is_active,
      partner_id: point.partner_id,
      partner_name: point.partner_name,
    }));
  }, [servicePointsData, permissions, operator]);

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (open && operator) {
      setSelectedPointIds([]);
      setActiveTab(0);
      setIsSubmitting(false);
    }
  }, [open, operator]);

  // Обработчики
  const handleAssignPoints = async () => {
    if (!operator || selectedPointIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await bulkAssignOperator({
        operatorId: operator.id,
        servicePointIds: selectedPointIds,
      }).unwrap();

      if (result.success && result.success.length > 0) {
        showSuccess(`Оператор назначен на ${result.success.length} точек`);
        setSelectedPointIds([]);
        refetchAssignments();
        onAssignmentSuccess?.();
      }

      if (result.failed && result.failed.length > 0) {
        showError(`Ошибка назначения на ${result.failed.length} точек: ${result.errors?.join(', ')}`);
      }
    } catch (error: any) {
      showError(`Ошибка назначения: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignPoint = async (pointId: number) => {
    if (!operator) return;

    try {
      await unassignOperator({
        operatorId: operator.id,
        servicePointId: pointId,
      }).unwrap();

      showSuccess('Назначение отозвано');
      refetchAssignments();
      onAssignmentSuccess?.();
    } catch (error: any) {
      showError(`Ошибка отзыва назначения: ${error.message}`);
    }
  };

  const handleClose = () => {
    setSelectedPointIds([]);
    setActiveTab(0);
    onClose();
  };

  if (!operator) return null;

  const isLoading = assignmentsLoading || servicePointsLoading;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <AssignmentIcon color="primary" />
            <Box>
              <Typography variant="h6">
                Управление назначениями
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {operator.user.full_name} ({operator.user.email})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Информация об операторе */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <OperatorIcon color="primary" fontSize="large" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      {operator.user.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {operator.user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Партнер: {operator.partner_name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box display="flex" gap={1}>
                      <Chip 
                        label={operator.is_active ? 'Активен' : 'Неактивен'}
                        color={operator.is_active ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip 
                        label={`Назначен на ${assignedPointIds.length} точек`}
                        color="info"
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Вкладки */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab 
                  label="Назначить на точки" 
                  icon={<AssignmentIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Текущие назначения" 
                  icon={<LocationIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="История" 
                  icon={<HistoryIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Вкладка: Назначить на точки */}
            <TabPanel value={activeTab} index={0}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Выберите сервисные точки для назначения
                </Typography>
                
                {availableServicePoints.length === 0 ? (
                  <Alert severity="info">
                    Нет доступных сервисных точек для назначения
                  </Alert>
                ) : (
                  <>
                    <ServicePointSelector
                      availablePoints={availableServicePoints}
                      assignedPointIds={assignedPointIds}
                      selectedPointIds={selectedPointIds}
                      onSelectionChange={setSelectedPointIds}
                      variant="cards"
                      showStats
                      label="Доступные сервисные точки"
                      error={selectedPointIds.length === 0 ? 'Выберите хотя бы одну точку' : undefined}
                    />

                    {selectedPointIds.length > 0 && (
                      <Box mt={3}>
                        <Alert severity="info">
                          Выбрано точек для назначения: {selectedPointIds.length}
                        </Alert>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </TabPanel>

            {/* Вкладка: Текущие назначения */}
            <TabPanel value={activeTab} index={1}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Текущие назначения ({assignedPointIds.length})
                </Typography>
                
                {currentAssignments.length === 0 ? (
                  <Alert severity="info">
                    Оператор пока не назначен ни на одну сервисную точку
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {currentAssignments
                      .filter(assignment => assignment.is_active)
                      .map((assignment) => (
                        <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                          <Card>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <LocationIcon color="success" fontSize="small" />
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {assignment.service_point.name}
                                  </Typography>
                                </Box>
                                <Tooltip title="Отозвать назначение">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleUnassignPoint(assignment.service_point.id)}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              <Typography variant="body2" color="text.secondary" mb={1}>
                                {assignment.service_point.address}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                Назначен: {new Date(assignment.assigned_at).toLocaleDateString('ru-RU')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>

            {/* Вкладка: История */}
            <TabPanel value={activeTab} index={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  История назначений
                </Typography>
                
                {currentAssignments.length === 0 ? (
                  <Alert severity="info">
                    История назначений пуста
                  </Alert>
                ) : (
                  <Box>
                    {currentAssignments.map((assignment) => (
                      <Box key={assignment.id} mb={2}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle2">
                                  {assignment.service_point.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {assignment.service_point.address}
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Chip 
                                  label={assignment.is_active ? 'Активно' : 'Отозвано'}
                                  color={assignment.is_active ? 'success' : 'default'}
                                  size="small"
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {new Date(assignment.assigned_at).toLocaleDateString('ru-RU')}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Закрыть
        </Button>
        {activeTab === 0 && selectedPointIds.length > 0 && (
          <Button
            variant="contained"
            onClick={handleAssignPoints}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSubmitting ? 'Назначение...' : `Назначить на ${selectedPointIds.length} точек`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 