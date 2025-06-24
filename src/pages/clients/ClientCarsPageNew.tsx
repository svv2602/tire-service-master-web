import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarTodayIcon,
  ConfirmationNumber as PlateIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Импорты API
import { 
  useGetClientByIdQuery,
  useGetClientCarsQuery, 
  useDeleteClientCarMutation 
} from '../../api/clients.api';

// Типы
import type { ClientCar } from '../../types/client';

// Утилиты
import { getBrandName, getModelName } from '../../utils/carUtils';

interface ClientCarsPageNewProps {}

const ClientCarsPageNew: React.FC<ClientCarsPageNewProps> = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Константы
  const PER_PAGE = 25;

  // API запросы
  const { data: client, isLoading: isLoadingClient, error: clientError } = useGetClientByIdQuery(clientId || '');
  const { data: carsData, isLoading: isLoadingCars, error: carsError } = useGetClientCarsQuery(clientId || '');
  const [deleteCar] = useDeleteClientCarMutation();

  const isLoading = isLoadingClient || isLoadingCars;
  const cars = carsData || [];

  // Фильтрация данных
  const filteredData = useMemo(() => {
    if (!searchQuery) return cars;
    
    return cars.filter(car => 
      getBrandName(car.brand).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getModelName(car.model).toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.year?.toString().includes(searchQuery)
    );
  }, [cars, searchQuery]);

  const totalItems = filteredData.length;

  // Обработчики событий
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработка удаления
  const handleDelete = useCallback(async (car: ClientCar) => {
    if (!clientId) return;

    try {
      await deleteCar({ clientId, carId: car.id.toString() }).unwrap();
      showNotification(`Автомобиль ${getBrandName(car.brand)} ${getModelName(car.model)} успешно удален`, 'success');
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении автомобиля';
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification(errorMessage, 'error');
    }
  }, [deleteCar, clientId, showNotification]);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: `Автомобили клиента`,
    subtitle: client ? `${client.first_name} ${client.last_name}` : 'Загрузка...',
    actions: [
      {
        label: 'Добавить автомобиль',
        icon: <AddIcon />,
        onClick: () => navigate(`/admin/clients/${clientId}/cars/new`),
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [client, navigate, clientId]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: 'Поиск по марке, модели, году или номеру...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'car',
      key: 'brand' as keyof ClientCar,
      label: 'Автомобиль',
      sortable: false,
      render: (car: ClientCar) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <CarIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getBrandName(car.brand)} {getModelName(car.model)}
            </Typography>
            {car.license_plate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <PlateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {car.license_plate}
                </Typography>
              </Box>
            )}
            {car.year && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {car.year} год
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'brand',
      key: 'brand' as keyof ClientCar,
      label: 'Марка',
      sortable: true,
      hideOnMobile: true,
      render: (car: ClientCar) => (
        <Typography variant="body2">
          {getBrandName(car.brand)}
        </Typography>
      )
    },
    {
      id: 'model',
      key: 'model' as keyof ClientCar,
      label: 'Модель',
      sortable: true,
      hideOnMobile: true,
      render: (car: ClientCar) => (
        <Typography variant="body2">
          {getModelName(car.model)}
        </Typography>
      )
    },
    {
      id: 'year',
      key: 'year' as keyof ClientCar,
      label: 'Год',
      sortable: true,
      hideOnMobile: true,
      render: (car: ClientCar) => (
        <Chip 
          label={car.year || '—'}
          size="small"
          color="info"
          icon={<CalendarTodayIcon />}
        />
      )
    },
    {
      id: 'license_plate',
      key: 'license_plate' as keyof ClientCar,
      label: 'Гос. номер',
      sortable: true,
      render: (car: ClientCar) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PlateIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {car.license_plate || '—'}
          </Typography>
        </Box>
      )
    }
  ], []);

  // Конфигурация действий
  const actionsConfig = useMemo(() => [
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (car: ClientCar) => navigate(`/admin/clients/${clientId}/cars/${car.id}/edit`),
      color: 'primary' as const
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error' as const,
      confirmationText: 'Вы уверены, что хотите удалить этот автомобиль?'
    }
  ], [navigate, clientId, handleDelete]);

  // Обработка случая, когда клиент не найден
  if (clientError || (!isLoadingClient && !client)) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Клиент не найден
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<ClientCar>
        header={headerConfig}
        search={searchConfig}
        columns={columns}
        rows={filteredData}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery ? 'Автомобили не найдены' : 'Нет автомобилей',
          description: searchQuery
            ? 'Попробуйте изменить критерии поиска'
            : 'Добавьте первый автомобиль для этого клиента',
          action: !searchQuery ? {
            label: 'Добавить автомобиль',
            icon: <AddIcon />,
            onClick: () => navigate(`/admin/clients/${clientId}/cars/new`)
          } : undefined
        }}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ClientCarsPageNew; 