import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  CardContent,
  Typography,
  InputAdornment,
  IconButton,
  Grid,
  Skeleton,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useGetServiceCategoriesQuery, useDeleteServiceCategoryMutation } from '../../api/services.api';
import { ServiceCategoryData } from '../../types/service';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Chip } from '../../components/ui/Chip';
import { Pagination } from '../../components/ui/Pagination';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';

const PER_PAGE = 25;

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategoryData | null>(null);

  const { data: response, isLoading, error, isFetching, isUninitialized } = useGetServiceCategoriesQuery({
    page,
    per_page: PER_PAGE,
    query: searchQuery || undefined,
  });

  console.log('🔍 NewServicesPage Debug - ПОЛНАЯ ИНФОРМАЦИЯ:', {
    response,
    isLoading,
    error,
    isFetching,
    isUninitialized,
    data: response?.data,
    pagination: response?.pagination,
    categories: response?.data?.length || 0,
    queryParams: {
      page,
      per_page: PER_PAGE,
      query: searchQuery || undefined,
    }
  });

  const categories = response?.data || [];
  const totalPages = response?.pagination ? Math.ceil(response.pagination.total_count / PER_PAGE) : 0;
  const [deleteCategory] = useDeleteServiceCategoryMutation();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDeleteClick = (category: ServiceCategoryData) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleAddCategory = () => {
    navigate('/services/new');
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке категорий услуг
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Услуги и Категории
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          Добавить категорию
        </Button>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию категории..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Список категорий */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                border: 'none'
              }}>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : categories.length === 0 ? (
        <Card sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? 'Категории услуг не найдены' : 'Категории услуг отсутствуют'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первую категорию услуг'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                border: 'none'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {category.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/services/${category.id}/edit`}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(category)}
                        color="error"
                        disabled={!!(category.services_count && category.services_count > 0)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {category.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      label={category.is_active ? 'Активна' : 'Неактивна'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`Услуг: ${category.services_count || 0}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(newPage: number) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        title="Удалить категорию услуг"
        maxWidth={400}
        actions={
          <>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </>
        }
      >
        <DialogContentText>
          Вы уверены, что хотите удалить категорию "{categoryToDelete?.name}"?
        </DialogContentText>
      </Modal>
    </Box>
  );
};
