// Шаг 5: Выбор услуг (опционально)

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  TextField as MuiTextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Build as ServiceIcon,
  AttachMoney as PriceIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт API хуков
// import { useGetServicesByServicePointQuery } from '../../../api/services.api';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';
import { Service } from '../../../types/models';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface ServicesStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

interface SelectedService {
  service_id: number;
  quantity: number;
  price: number;
  name?: string;
}

const ServicesStep: React.FC<ServicesStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const theme = useTheme();
  
  // Временные данные услуг (заглушка до создания API)
  const services: Service[] = [];
  const isLoadingServices = false;
  const servicesError = null;
  
  // Обработчик добавления услуги
  const handleAddService = (service: Service) => {
    const existingServiceIndex = formData.services.findIndex(s => s.service_id === service.id);
    
    if (existingServiceIndex >= 0) {
      // Увеличиваем количество
      const updatedServices = [...formData.services];
      updatedServices[existingServiceIndex].quantity += 1;
      
      setFormData(prev => ({
        ...prev,
        services: updatedServices,
      }));
    } else {
      // Добавляем новую услугу
      const newService: SelectedService = {
        service_id: service.id,
        quantity: 1,
        price: service.price || 0,
        name: service.name,
      };
      
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService],
      }));
    }
  };
  
  // Обработчик удаления услуги
  const handleRemoveService = (serviceId: number) => {
    const existingServiceIndex = formData.services.findIndex(s => s.service_id === serviceId);
    
    if (existingServiceIndex >= 0) {
      const updatedServices = [...formData.services];
      
      if (updatedServices[existingServiceIndex].quantity > 1) {
        // Уменьшаем количество
        updatedServices[existingServiceIndex].quantity -= 1;
      } else {
        // Удаляем услугу полностью
        updatedServices.splice(existingServiceIndex, 1);
      }
      
      setFormData(prev => ({
        ...prev,
        services: updatedServices,
      }));
    }
  };
  
  // Обработчик изменения комментария
  const handleNotesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: value,
    }));
  };
  
  // Получение количества выбранной услуги
  const getServiceQuantity = (serviceId: number) => {
    const service = formData.services.find(s => s.service_id === serviceId);
    return service?.quantity || 0;
  };
  
  // Подсчет общей стоимости
  const calculateTotalPrice = () => {
    return formData.services.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  };
  
  // Рендер карточки услуги
  const renderServiceCard = (service: Service) => {
    const quantity = getServiceQuantity(service.id);
    const isSelected = quantity > 0;
    
    return (
      <Card
        key={service.id}
        sx={{
          ...getCardStyles(theme),
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea onClick={() => handleAddService(service)}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                {service.name}
              </Typography>
              {isSelected && (
                <Chip
                  label={`×${quantity}`}
                  color="primary"
                  size="small"
                  variant="filled"
                />
              )}
            </Box>
            
            {service.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {service.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriceIcon color="action" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {service.price ? `${service.price} ₴` : 'Цена по запросу'}
                </Typography>
              </Box>
              
              {isSelected && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveService(service.id);
                    }}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddService(service);
                    }}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };
  
  if (!formData.service_point_id) {
    return (
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Выбор услуг
        </Typography>
        <Alert severity="warning">
          Сначала необходимо выбрать точку обслуживания.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Выбор услуг и комментарии
      </Typography>
      
      <Grid container spacing={3}>
        {/* Информационное сообщение */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            💡 Выбор услуг необязателен. Вы можете обсудить необходимые услуги с мастером на месте.
          </Alert>
        </Grid>
        
        {/* Список услуг */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Доступные услуги
          </Typography>
          
          {servicesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка загрузки услуг. Попробуйте обновить страницу.
            </Alert>
          )}
          
          {isLoadingServices ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : services.length === 0 ? (
            <Alert severity="info">
              Список услуг для данной точки обслуживания пуст. 
              Вы можете обсудить необходимые услуги с мастером на месте.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} key={service.id}>
                  {renderServiceCard(service)}
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        {/* Боковая панель с выбранными услугами */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...getCardStyles(theme), p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ServiceIcon color="primary" />
              Выбранные услуги
            </Typography>
            
            {formData.services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Услуги не выбраны
              </Typography>
            ) : (
              <Box>
                {formData.services.map((service: SelectedService, index: number) => {
                  const serviceInfo = services.find((s: Service) => s.id === service.service_id);
                  return (
                    <Box key={service.service_id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {serviceInfo?.name || `Услуга #${service.service_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {service.price} ₴ × {service.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {service.price * service.quantity} ₴
                        </Typography>
                      </Box>
                      {index < formData.services.length - 1 && <Divider />}
                    </Box>
                  );
                })}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Итого:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {calculateTotalPrice()} ₴
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData(prev => ({ ...prev, services: [] }))}
                  sx={{ mt: 2, width: '100%' }}
                >
                  Очистить все
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Комментарии */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Комментарий к записи (необязательно)
          </Typography>
          
          <MuiTextField
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Укажите дополнительные пожелания, особенности автомобиля или другую важную информацию..."
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <Box sx={{ pt: 1, pr: 1 }}>
                  <CommentIcon color="action" />
                </Box>
              ),
            }}
          />
        </Grid>
      </Grid>
      
      {/* Информация о следующем шаге */}
      <Alert severity="success" sx={{ mt: 3 }}>
        ✅ Этап выбора услуг завершен
      </Alert>
    </Box>
  );
};

export default ServicesStep;
