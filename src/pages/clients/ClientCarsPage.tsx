import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useGetClientByIdQuery } from '../../api/clients.api';
import { useGetClientCarsQuery, useDeleteClientCarMutation } from '../../api/clients.api';
import { ClientCar } from '../../types/client';
import { getBrandName, getModelName } from '../../utils/carUtils';

// Импорты UI компонентов
import {
  Button,
  Table,
  type Column
} from '../../components/ui';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

const ClientCarsPage: React.FC = () => {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Получаем централизованные стили таблицы
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<ClientCar | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId || '');
  const { data: cars, isLoading: isLoadingCars } = useGetClientCarsQuery(clientId || '');
  const [deleteCar, { isLoading: isDeleting }] = useDeleteClientCarMutation();

  const isLoading = isLoadingClient || isLoadingCars;

  // Мемоизированные обработчики событий
  const handleDeleteClick = useCallback((car: ClientCar) => {
    setSelectedCar(car);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCar || !clientId) return;

    try {
      await deleteCar({ clientId, carId: selectedCar.id.toString() }).unwrap();
      setDeleteDialogOpen(false);
      setSelectedCar(null);
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = t('admin.clients.cars.deleteError');
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setDeleteDialogOpen(false);
    }
  }, [selectedCar, deleteCar, clientId]);

  const handleEditClick = useCallback((carId: number) => {
    navigate(`/admin/clients/${clientId}/cars/${carId}/edit`);
  }, [navigate, clientId]);

  // Конфигурация колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'brand',
      label: t('admin.clients.cars.columns.brand'),
      wrap: true,
      format: (value, row: ClientCar) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <CarIcon />
          <Typography>{getBrandName(row.brand)}</Typography>
        </Box>
      )
    },
    {
      id: 'model',
      label: t('admin.clients.cars.columns.model'),
      wrap: true,
      format: (value, row: ClientCar) => (
        <Typography>{getModelName(row.model)}</Typography>
      )
    },
    {
      id: 'year',
      label: t('admin.clients.cars.columns.year'),
      align: 'center'
    },
    {
      id: 'license_plate',
      label: t('admin.clients.cars.columns.licensePlate'),
      wrap: true
    },
    {
      id: 'actions',
      label: t('admin.clients.cars.columns.actions'),
      align: 'right',
      format: (value, row: ClientCar) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title={t('admin.clients.cars.actions.edit')}>
            <IconButton
              size="small"
              onClick={() => handleEditClick(row.id)}
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('admin.clients.cars.actions.delete')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row)}
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [handleEditClick, handleDeleteClick, tablePageStyles, getBrandName, getModelName, t]);

  // Обработка загрузки
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  // Обработка случая, когда клиент не найден
  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('admin.clients.cars.clientNotFound')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.container}>
      {/* Отображение ошибок */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" sx={tablePageStyles.title}>
          {t('admin.clients.cars.pageTitle', { name: `${client.first_name} ${client.last_name}` })}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/admin/clients/${clientId}/cars/new`)}
          sx={tablePageStyles.createButton}
        >
          {t('admin.clients.cars.addCar')}
        </Button>
      </Box>

      {/* Таблица автомобилей */}
      <Table 
        columns={columns} 
        rows={cars || []}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('admin.clients.cars.deleteDialog.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.clients.cars.deleteDialog.message', { 
              carName: selectedCar ? `${getBrandName(selectedCar.brand)} ${getModelName(selectedCar.model)}` : ''
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('admin.clients.cars.deleteDialog.cancel')}
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            disabled={isDeleting}
          >
            {t('admin.clients.cars.deleteDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientCarsPage;