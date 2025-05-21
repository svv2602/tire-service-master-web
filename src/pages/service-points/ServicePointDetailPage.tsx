import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchServicePointById, clearError } from '../../store/slices/servicePointsSlice';
import { useNavigate, useParams } from 'react-router-dom';

const ServicePointDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedServicePoint, loading, error } = useSelector((state: RootState) => state.servicePoints);

  useEffect(() => {
    if (id) {
      dispatch(fetchServicePointById(Number(id)));
    }
    
    return () => {
      // Очистка при размонтировании компонента
      dispatch(clearError());
    };
  }, [id, dispatch]);

  const handleEdit = () => {
    if (selectedServicePoint) {
      navigate(`/partners/${selectedServicePoint.partner_id}/service-points/${selectedServicePoint.id}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/service-points');
  };

  const handleViewPhotos = () => {
    navigate(`/service-points/${id}/photos`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  if (!selectedServicePoint) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Сервисная точка не найдена
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {selectedServicePoint.name}
        </Typography>
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Назад к списку
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        </Box>
      </Box>

      <Chip 
        label={`Статус: ${selectedServicePoint.status?.name || 'Неизвестно'}`} 
        color={selectedServicePoint.status_id === 1 ? 'success' : selectedServicePoint.status_id === 2 ? 'warning' : 'error'} 
        sx={{ mb: 2 }}
      />
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Основная информация</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOnIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Адрес</Typography>
                    <Typography variant="body1">
                      {selectedServicePoint.city?.name}, {selectedServicePoint.address}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <PhoneIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Телефон</Typography>
                    <Typography variant="body1">
                      {selectedServicePoint.contact_phone || 'Не указан'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <BusinessIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Партнер</Typography>
                    <Typography variant="body1">
                      {selectedServicePoint.partner?.company_name || 'Не указан'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {selectedServicePoint.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Описание</Typography>
                <Typography variant="body1" paragraph>
                  {selectedServicePoint.description}
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhotoCameraIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Фотографии</Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<PhotoCameraIcon />} 
                onClick={handleViewPhotos}
              >
                Управление фото
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {selectedServicePoint.photos && selectedServicePoint.photos.length > 0 ? (
              <Grid container spacing={2}>
                {selectedServicePoint.photos.slice(0, 4).map(photo => (
                  <Grid size={{ xs: 6, sm: 3 }} key={photo.id}>
                    <img 
                      src={photo.photo_url} 
                      alt={`Фото ${photo.id}`} 
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Нет фотографий
              </Typography>
            )}
          </Paper>
          
          {/* Секция с услугами */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Услуги</Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<EditIcon />} 
                onClick={() => navigate(`/service-points/${id}/services`)}
              >
                Управление услугами
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {selectedServicePoint.services && selectedServicePoint.services.length > 0 ? (
              <Box>
                {selectedServicePoint.services.map((service: { id: number; name: string; price: number }) => (
                  <Chip 
                    key={service.id}
                    label={`${service.name} - ${service.price} ₽`}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Нет доступных услуг
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Параметры обслуживания</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Количество постов</Typography>
                <Typography variant="h5">{selectedServicePoint.post_count}</Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Длительность слота (мин)</Typography>
                <Typography variant="h5">{selectedServicePoint.default_slot_duration}</Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Статистика</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Рейтинг</Typography>
                <Typography variant="h5">
                  {selectedServicePoint.average_rating !== undefined && selectedServicePoint.average_rating !== null 
                    ? Number(selectedServicePoint.average_rating).toFixed(1) 
                    : 'Нет данных'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Обслужено клиентов</Typography>
                <Typography variant="h5">{selectedServicePoint.total_clients_served || 0}</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Процент отмен</Typography>
                <Typography variant="h5">
                  {selectedServicePoint.cancellation_rate !== undefined && selectedServicePoint.cancellation_rate !== null
                    ? (Number(selectedServicePoint.cancellation_rate) * 100).toFixed(1) + '%'
                    : '0%'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServicePointDetailPage; 