import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton
} from '@mui/material';
import { useGetServiceCategoriesQuery } from '../../../api/serviceCategories.api';

interface CategorySelectionStepProps {
  formData: any; // Используем any для совместимости с существующей структурой
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  formData,
  setFormData,
  onNext,
  isValid
}) => {
  const { data: categoriesResponse, isLoading, error } = useGetServiceCategoriesQuery({ 
    active: true,
    per_page: 50 
  });

  const categories = categoriesResponse?.data || [];

  const handleCategorySelect = (categoryId: number) => {
    setFormData((prev: any) => ({ 
      ...prev,
      service_category_id: categoryId,
      // Сбрасываем следующие шаги при смене категории
      city_id: null,
      service_point_id: null,
      booking_date: '',
      start_time: ''
    }));
    
    // Автоматически переходим к следующему шагу
    setTimeout(() => {
      onNext();
    }, 300);
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите тип услуг
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите тип услуг
        </Typography>
        <Alert severity="error">
          Ошибка загрузки категорий услуг. Попробуйте обновить страницу.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выберите тип услуг
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Выберите категорию услуг для поиска подходящих сервисных точек
      </Typography>

      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: 2,
                borderColor: formData.service_category_id === category.id 
                  ? 'primary.main' 
                  : 'transparent',
                backgroundColor: formData.service_category_id === category.id 
                  ? 'primary.50' 
                  : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: 2
                }
              }}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                {category.description && (
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                )}
                {category.services_count && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Доступно услуг: {category.services_count}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {categories.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Категории услуг не найдены. Обратитесь к администратору.
        </Alert>
      )}

      {!formData.service_category_id && categories.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Выберите категорию услуг для продолжения
        </Alert>
      )}
    </Box>
  );
};

export default CategorySelectionStep; 