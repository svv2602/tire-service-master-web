// filepath: /home/snisar/mobi_tz/tire-service-master-web/src/pages/services/ServicesPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Pagination,
  useTheme, // Добавлен импорт для темы
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetServiceCategoriesQuery, 
  useDeleteServiceCategoryMutation,
  useToggleServiceCategoryActiveMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryData } from '../../types/service';
import Notification from '../../components/Notification';
// Импорты централизованной системы стилей
import { SIZES } from '../../styles/theme';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles
} from '../../styles/components';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Получение темы и централизованных стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme) as any;
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12; // Для карточного интерфейса
  
  // Состояние для диалогов и уведомлений
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // RTK Query хуки
  const { 
    data: categoriesData, 
    isLoading, 
    error 
  } = useGetServiceCategoriesQuery({
    query: search || undefined,
    active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page,
    per_page: PER_PAGE,
  });

  const [deleteCategory] = useDeleteServiceCategoryMutation();
  const [toggleActive] = useToggleServiceCategoryActiveMutation();

  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.pagination?.total_pages || 0;

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ServicesPage Debug Info:');
    console.log('📊 Categories Data:', categoriesData);
    console.log('🔢 Categories Count:', categories.length);
    console.log('📋 Categories:', categories);
    console.log('⚠️ Error:', error);
    console.log('⏳ Loading:', isLoading);
  }

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDeleteClick = (category: { id: number; name: string }) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory(selectedCategory.id.toString()).unwrap();
        setNotification({
          open: true,
          message: `Категория "${selectedCategory.name}" успешно удалена`,
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } catch (error: any) {
        let errorMessage = 'Ошибка при удалении категории';
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.errors) {
          errorMessage = Object.values(error.data.errors).join(', ');
        }
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive({ id: id.toString(), is_active: !currentActive }).unwrap();
      setNotification({
        open: true,
        message: `Статус категории успешно изменен`,
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса';
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.lg }}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.md 
      }}>
        <Typography 
          sx={{ 
            fontSize: SIZES.fontSize.xl, 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Категории услуг
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/services/new')}
          sx={buttonStyles}
        >
          Добавить категорию
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ ...cardStyles, p: SIZES.spacing.md, mb: SIZES.spacing.md }}>
        <Box sx={{ display: 'flex', gap: SIZES.spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию категории"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ ...textFieldStyles, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ ...textFieldStyles, minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={activeFilter}
              onChange={handleActiveFilterChange}
              label="Статус"
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Активные</MenuItem>
              <MenuItem value="false">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Сообщения об ошибках */}
      {error && (
        <Alert severity="error" sx={{ mb: SIZES.spacing.md }}>
          Произошла ошибка: {error.toString()}
        </Alert>
      )}

      {/* Карточки категорий */}
      <Grid container spacing={SIZES.spacing.md}>
        {categories.map((category: ServiceCategoryData) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                ...cardStyles,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: category.is_active ? 1 : 0.8,
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[3],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: SIZES.spacing.md }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: SIZES.spacing.sm, mb: SIZES.spacing.sm }}>
                  <CategoryIcon sx={{ mt: 0.5, color: theme.palette.primary.main }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      sx={{ 
                        fontSize: SIZES.fontSize.lg, 
                        fontWeight: 500, 
                        mb: SIZES.spacing.xs,
                        color: theme.palette.text.primary
                      }}
                    >
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography
                        sx={{
                          fontSize: SIZES.fontSize.md,
                          color: theme.palette.text.secondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {category.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs, mt: SIZES.spacing.sm }}>
                  <Chip 
                    label={category.is_active ? 'Активна' : 'Неактивна'}
                    color={category.is_active ? 'success' : 'default'}
                    size="small"
                    sx={category.is_active ? chipStyles.success : chipStyles.error}
                  />
                  {category.services_count !== undefined && (
                    <Tooltip title="Количество услуг">
                      <Chip
                        icon={<FormatListNumberedIcon />}
                        label={category.services_count}
                        size="small"
                        variant="outlined"
                        sx={{ ...chipStyles.info, variant: 'outlined' }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {category.created_at && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs, mt: SIZES.spacing.sm }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography 
                      sx={{ 
                        fontSize: SIZES.fontSize.sm,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {new Date(category.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: SIZES.spacing.sm, pt: 0 }}>
                <Box>
                  <Tooltip title="Редактировать">
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/services/${category.id}/edit`)}
                      sx={{
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}15`
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton 
                      size="small"
                      onClick={() => handleDeleteClick(category)}
                      sx={{
                        '&:hover': {
                          backgroundColor: `${theme.palette.error.main}15`
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={category.is_active ? "Деактивировать" : "Активировать"}>
                    <IconButton 
                      size="small"
                      onClick={() => handleToggleActive(category.id, category.is_active)}
                      sx={{
                        '&:hover': {
                          backgroundColor: `${theme.palette.info.main}15`
                        }
                      }}
                    >
                      {category.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Пустое состояние */}
      {categories.length === 0 && !isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={SIZES.spacing.xl}
          sx={{
            ...cardStyles,
            mt: SIZES.spacing.md,
            minHeight: '200px'
          }}
        >
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: SIZES.spacing.md }} />
          <Typography 
            sx={{ 
              fontSize: SIZES.fontSize.lg, 
              fontWeight: 500,
              mb: SIZES.spacing.sm 
            }}
          >
            {search || activeFilter !== '' ? 'Категории не найдены' : 'Нет категорий услуг'}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: SIZES.fontSize.md,
              color: theme.palette.text.secondary,
              textAlign: 'center',
              mb: SIZES.spacing.md
            }}
          >
            {search || activeFilter !== '' 
              ? 'Попробуйте изменить критерии поиска'
              : 'Создайте первую категорию услуг для начала работы'
            }
          </Typography>
          {!search && activeFilter === '' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/services/new')}
              sx={buttonStyles}
            >
              Добавить категорию
            </Button>
          )}
        </Box>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mt={SIZES.spacing.lg}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: SIZES.fontSize.md,
                minWidth: '36px',
                height: '36px',
                borderRadius: SIZES.borderRadius.sm
              }
            }}
          />
        </Box>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            ...cardStyles,
            borderRadius: SIZES.borderRadius.md
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: SIZES.fontSize.lg, 
          fontWeight: 600,
          pt: SIZES.spacing.md
        }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.sm }}>
          <DialogContentText sx={{ fontSize: SIZES.fontSize.md }}>
            Вы действительно хотите удалить категорию "{selectedCategory?.name}"?
            Все услуги в этой категории также будут удалены.
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: SIZES.spacing.md, pt: SIZES.spacing.sm }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              ...getButtonStyles(theme, 'secondary'),
              fontSize: SIZES.fontSize.md
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            sx={{
              ...getButtonStyles(theme, 'error'),
              fontSize: SIZES.fontSize.md
            }}
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ServicesPage;
