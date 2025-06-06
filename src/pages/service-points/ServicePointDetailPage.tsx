import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  CardMedia,
  Rating,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Photo as PhotoIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServicePointByIdQuery,
  useGetServicePointServicesQuery,
  useGetServicePointBasicInfoQuery,
} from '../../api';
import { useTranslation } from 'react-i18next';
import { ServicePoint } from '../../types/models';
import { ResponsiveImage } from '../../components/styled/CommonComponents';

const ServicePointDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: basicInfo } = useGetServicePointBasicInfoQuery(id || '', {
    skip: !id
  });

  const { data: servicePoint, isLoading, error } = useGetServicePointByIdQuery(
    { 
      partner_id: basicInfo?.partner_id || 0,
      id: id || ''
    },
    {
      skip: !id || !basicInfo?.partner_id
    }
  );

  const handleBack = () => {
    navigate('/service-points');
  };

  const handleEdit = () => {
    navigate(`/service-points/${id}/edit`);
  };

  const handlePhotos = () => {
    navigate(`/service-points/${id}/photos`);
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error.toString()}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!servicePoint) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{servicePoint.name}</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhotoIcon />}
            onClick={handlePhotos}
          >
            Фотографии
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Основная информация</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Адрес
                    </Typography>
                    <Typography>{servicePoint.address}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <PhoneIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Контактный телефон
                    </Typography>
                    <Typography>{servicePoint.contact_phone}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <BusinessIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Партнер
                    </Typography>
                    <Typography>{servicePoint.partner?.company_name}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Фотографии</Typography>
            </Box>
            
            {servicePoint.photos && servicePoint.photos.length > 0 ? (
              <Grid container spacing={2}>
                {servicePoint.photos.slice(0, 4).map((photo) => (
                  <Grid item xs={6} sm={3} key={photo.id}>
                    <ResponsiveImage
                      src={photo.url} 
                      alt={`Фото ${photo.id}`}
                      borderRadius={4}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Фотографии отсутствуют
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Параметры обслуживания</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Количество постов
                  </Typography>
                  <Typography>{servicePoint.post_count}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Длительность слота по умолчанию
                  </Typography>
                  <Typography>{servicePoint.default_slot_duration} минут</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServicePointDetailPage; 