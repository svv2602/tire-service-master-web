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
import { useGetCarModelsByBrandIdQuery } from '../../api/carModels.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { ClientCarFormData } from '../../types/client';
import { UserRole } from '../../types/user-role';
import { useInvalidateCache } from '../../api/baseApi';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // API хуки
  const [createMyClientCar] = useCreateMyClientCarMutation();
  const [createClientCar] = useCreateClientCarMutation();
  const { data: carBrandsData } = useGetCarBrandsQuery({});
  const { data: carTypesData } = useGetCarTypesQuery({});
  const invalidateCache = useInvalidateCache();

  // Получаем текущего пользователя из Redux
  const currentUser = useSelector(selectCurrentUser);

  // Находим бренд по названию для получения его ID
  const foundBrand = carData.car_brand && carBrandsData?.data ? 
    carBrandsData.data.find(brand => 
      brand.name.toLowerCase() === carData.car_brand!.toLowerCase()
    ) : null;

  // Получаем модели для найденного бренда
  const { data: carModelsData } = useGetCarModelsByBrandIdQuery(
    foundBrand ? { brandId: foundBrand.id.toString() } : { brandId: '0' },
    { skip: !foundBrand }
  );

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
      let brandId: number;
      if (foundBrand) {
        brandId = foundBrand.id;
        console.log('✅ Найден бренд:', foundBrand.name, 'ID:', brandId);
      } else {
        // Если бренд не найден, используем первый доступный
        if (carBrandsData?.data && carBrandsData.data.length > 0) {
          brandId = carBrandsData.data[0].id;
          console.log('⚠️ Бренд не найден, используем первый доступный:', carBrandsData.data[0].name, 'ID:', brandId);
        } else {
          throw new Error('Не удалось найти доступные бренды автомобилей');
        }
      }

      // Ищем модель по названию в найденном бренде
      let modelId: number;
      if (carData.car_model && carModelsData?.car_models) {
        const foundModel = carModelsData.car_models.find(model => 
          model.name.toLowerCase() === carData.car_model!.toLowerCase()
        );
        if (foundModel) {
          modelId = foundModel.id;
          console.log('✅ Найдена модель:', foundModel.name, 'ID:', modelId);
        } else {
          // Если модель не найдена, используем первую доступную для данного бренда
          if (carModelsData.car_models.length > 0) {
            modelId = carModelsData.car_models[0].id;
            console.log('⚠️ Модель не найдена, используем первую доступную для бренда:', carModelsData.car_models[0].name, 'ID:', modelId);
          } else {
            throw new Error(`Не удалось найти модели для бренда ${foundBrand?.name || 'выбранного бренда'}`);
          }
        }
      } else {
        // Если название модели не указано, используем первую доступную для бренда
        if (carModelsData?.car_models && carModelsData.car_models.length > 0) {
          modelId = carModelsData.car_models[0].id;
          console.log('ℹ️ Название модели не указано, используем первую доступную:', carModelsData.car_models[0].name, 'ID:', modelId);
        } else {
          throw new Error(`Не удалось найти модели для бренда ${foundBrand?.name || 'выбранного бренда'}`);
        }
      }

      // Подготавливаем данные для создания автомобиля
      const carFormData: ClientCarFormData = {
        brand_id: brandId,
        model_id: modelId,
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
      
      // Инвалидируем кэш автомобилей для обновления списка
      invalidateCache.invalidateList(['ClientCars']);
      
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CarIcon color="primary" />
          <Typography variant="h6">
            {t('bookingModals.addCarTitle')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              ✅ Автомобиль успешно добавлен в профиль!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Теперь вы можете быстро выбирать этот автомобиль при создании новых бронирований.
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('bookingModals.addCarDescription')}
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {t('bookingModals.carData')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('bookingModals.number')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {carData.license_plate}
                    </Typography>
                  </Box>
                  
                  {carData.car_brand && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('bookingModals.brand')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {carData.car_brand}
                      </Typography>
                    </Box>
                  )}
                  
                  {carData.car_model && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('bookingModals.model')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {carData.car_model}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('bookingModals.type')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {getCarTypeName(carData.car_type_id)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('bookingModals.afterAdd')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {success ? (
          <Button onClick={handleClose} color="primary" variant="contained">
            Закрыть
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={isAdding}>
              {t('bookingModals.skip')}
            </Button>
            <Button
              onClick={handleAddCar}
              disabled={isAdding}
              variant="contained"
              startIcon={isAdding ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {isAdding ? 'Добавление...' : t('bookingModals.add')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}; 