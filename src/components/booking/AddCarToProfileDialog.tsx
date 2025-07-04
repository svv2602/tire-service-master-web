import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useCreateMyClientCarMutation, useCreateClientCarMutation } from '../../api/clients.api';
import { useGetCarBrandsQuery } from '../../api/carBrands.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { ClientCarFormData } from '../../types/client';
import { UserRole } from '../../types/user-role';

interface AddCarToProfileDialogProps {
  open: boolean;
  onClose: () => void;
  carData: {
    license_plate: string;
    car_brand?: string;
    car_model?: string;
    car_type_id?: number;
  };
  onCarAdded?: (car: any) => void;
}

export const AddCarToProfileDialog: React.FC<AddCarToProfileDialogProps> = ({
  open,
  onClose,
  carData,
  onCarAdded,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // API хуки
  const [createMyClientCar] = useCreateMyClientCarMutation();
  const [createClientCar] = useCreateClientCarMutation();
  const { data: carBrandsData } = useGetCarBrandsQuery({});
  const { data: carTypesData } = useGetCarTypesQuery();

  // Получаем текущего пользователя из Redux
  const currentUser = useSelector(selectCurrentUser);

  // Проверяем, что carData передан
  if (!carData) {
    return null;
  }

  // Проверяем, что есть обязательные данные
  if (!carData.license_plate || !carData.license_plate.trim()) {
    return null;
  }

  const handleAddCar = async () => {
    try {
      setIsAdding(true);
      setError(null);

      console.log('🔍 Текущий пользователь:', currentUser);
      console.log('🔍 Роль пользователя:', currentUser?.role);
      console.log('🔍 Client ID пользователя:', currentUser?.client_id);

      // Ищем бренд по названию
      let brandId = 1; // Дефолтный бренд
      if (carData.car_brand && carBrandsData?.data) {
        const foundBrand = carBrandsData.data.find(brand => 
          brand.name.toLowerCase() === carData.car_brand!.toLowerCase()
        );
        if (foundBrand) {
          brandId = foundBrand.id;
        }
      }

      // Подготавливаем данные для создания автомобиля
      const carFormData: ClientCarFormData = {
        brand_id: brandId,
        model_id: 1, // Базовая модель (пока нет поиска по названию)
        year: new Date().getFullYear(), // Текущий год по умолчанию
        license_plate: carData.license_plate,
        car_type_id: carData.car_type_id || undefined,
        is_primary: false, // Не делаем основным автоматически
      };

      console.log('🚗 Добавление автомобиля в профиль:', carFormData);

      // Определяем, какой API запрос использовать и подготавливаем данные
      let result;
      
      if (currentUser?.role === UserRole.CLIENT) {
        // Для клиентов используем auth/me/cars (данные уже обернуты в { car: data } в API)
        console.log('🚗 Добавление автомобиля через auth/me/cars (клиент)');
        result = await createMyClientCar(carFormData).unwrap();
      } else {
        // Для других ролей используем общий API
        // Для администраторов и других ролей нужно определить ID клиента
        let clientId = currentUser?.client_id;
        
        // Если у пользователя нет client_id, используем ID текущего авторизованного пользователя
        if (!clientId && currentUser?.id) {
          // Для администраторов, которые создают бронирование, используем их собственный ID как client_id
          // Это работает, если администратор создает бронирование для себя
          clientId = currentUser.id;
        }
        
        if (!clientId) {
          throw new Error('Не удалось определить ID клиента для добавления автомобиля');
        }
        
        console.log('🚗 Добавление автомобиля через общий API (админ/партнер/менеджер), clientId:', clientId);
        result = await createClientCar({
          clientId: clientId.toString(),
          data: { car: carFormData } // Оборачиваем данные в { car: data }
        }).unwrap();
      }
      
      console.log('✅ Автомобиль успешно добавлен:', result);
      setSuccess(true);
      
      // Уведомляем родительский компонент
      if (onCarAdded) {
        onCarAdded(result);
      }

      // Закрываем диалог через 2 секунды
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('❌ Ошибка добавления автомобиля:', err);
      setError(err?.data?.error || err?.message || 'Произошла ошибка при добавлении автомобиля');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  // Получаем название типа автомобиля
  const getCarTypeName = (carTypeId?: number) => {
    if (!carTypeId || !carTypesData) return 'Не указан';
    const carType = carTypesData.find(type => type.id === carTypeId);
    return carType ? carType.name : 'Не найден';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isAdding}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CarIcon color="primary" />
          <Typography variant="h6">
            Добавить автомобиль в профиль
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1">
              Автомобиль успешно добавлен в ваш профиль!
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Вы использовали автомобиль для бронирования, которого нет в профиле. 
              Хотите добавить его для удобства будущих бронирований?
            </Typography>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Данные автомобиля
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Номер:
                    </Typography>
                    <Chip 
                      label={carData.license_plate} 
                      variant="outlined" 
                      size="small"
                      color="primary"
                    />
                  </Box>

                  {carData.car_brand && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Марка:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {carData.car_brand}
                      </Typography>
                    </Box>
                  )}

                  {carData.car_model && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Модель:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {carData.car_model}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Тип:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {getCarTypeName(carData.car_type_id)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              После добавления можно будет быстро выбирать этот автомобиль при создании новых бронирований.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={isAdding}
          startIcon={<CloseIcon />}
        >
          {success ? 'Закрыть' : 'Не добавлять'}
        </Button>
        
        {!success && (
          <Button
            onClick={handleAddCar}
            disabled={isAdding}
            variant="contained"
            startIcon={isAdding ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {isAdding ? 'Добавление...' : 'Добавить в профиль'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 