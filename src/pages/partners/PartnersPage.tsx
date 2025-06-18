import React, { useState, useCallback, useMemo } from 'react';
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useTogglePartnerActiveMutation,
} from '../../api';
import { Partner } from '../../types/models';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

// Импорты UI компонентов
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Pagination,
  Chip,
  Card,
} from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

// Импорты централизованных стилей
import { getTablePageStyles } from '../../styles/components';

/**
 * Страница управления партнерами
 * 
 * Функциональность:
 * - Отображение списка партнеров в табличном формате
 * - Поиск партнеров по названию компании
 * - Пагинация результатов
 * - Редактирование партнеров (переход к форме редактирования)
 * - Удаление партнеров с подтверждением
 * - Изменение статуса активности партнеров
 * - Создание тестовых партнеров для разработки
 * - Централизованная система стилей для консистентного UI
 * 
 * Особенности:
 * - Debounce поиска для оптимизации запросов к API
 * - Мемоизация компонентов и обработчиков для производительности
 * - Обработка ошибок загрузки и состояний
 * - Responsive дизайн с централизованными стилями
 */

// Хук для debounce поиска партнеров
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Мемоизированный компонент строки партнера с централизованными стилями
const PartnerRow = React.memo(({ 
  partner, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  getInitials,
  tablePageStyles
}: {
  partner: Partner;
  onEdit: (id: number) => void;
  onToggleStatus: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  getInitials: (partner: Partner) => string;
  tablePageStyles: any;
}) => {
  return (
    <TableRow key={partner.id}>
      <TableCell>
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getInitials(partner)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {partner.company_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {partner.company_description}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {partner.contact_person}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {partner.user?.phone}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {partner.user?.email}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={partner.is_active ? 'Активен' : 'Неактивен'}
          color={partner.is_active ? 'success' : 'error'}
          size="small"
        />
      </TableCell>

      <TableCell align="right">
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton
              onClick={() => onEdit(partner.id)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => onDelete(partner)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
});

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  
  // Состояние для диалогов и ошибок
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    page: page + 1,
    per_page: pageSize,
  }), [debouncedSearch, page, pageSize]);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading, 
    error 
  } = useGetPartnersQuery(queryParams);

  const [deletePartner, { isLoading: deleteLoading }] = useDeletePartnerMutation();
  const [togglePartnerActive, { isLoading: toggleLoading }] = useTogglePartnerActiveMutation();

  const partners = partnersData?.data || [];
  // Если нет пагинации в ответе, используем длину массива
  const totalItems = partnersData?.pagination?.total_count || partners.length;





  // Вспомогательная функция для получения текста ошибки
  const getErrorMessage = (error: FetchBaseQueryError | SerializedError): string => {
    if ('status' in error) {
      const fetchError = error as FetchBaseQueryError;
      return (fetchError.data as { message?: string })?.message || 'Ошибка сервера';
    }
    return (error as SerializedError).message || 'Неизвестная ошибка';
  };

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage - 1);
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteClick = useCallback((partner: Partner) => {
    setSelectedPartner(partner);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedPartner) {
      try {
        await deletePartner(selectedPartner.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedPartner(null);
        setErrorMessage(null); // Clear any previous errors
      } catch (error: any) {
        let errorMessage = 'Ошибка при удалении партнера';
        
        if (error.data?.error) {
          errorMessage = error.data.error;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.errors) {
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setErrorMessage(errorMessage);
        setDeleteDialogOpen(false);
      }
    }
  }, [selectedPartner, deletePartner]);

  const handleToggleStatus = useCallback(async (partner: Partner) => {
    try {
      await togglePartnerActive({
        id: partner.id,
        isActive: !partner.is_active
      }).unwrap();
      setErrorMessage(null); // Clear any previous errors
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса партнера';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  }, [togglePartnerActive]);

  // Мемоизированная функция для получения инициалов
  const getPartnerInitials = useCallback((partner: Partner) => {
    return partner.company_name.charAt(0).toUpperCase() || 'П';
  }, []);

  // Мемоизированные обработчики для PartnerRow
  const handleEditPartner = useCallback((id: number) => {
    navigate(`/partners/${id}/edit`);
  }, [navigate]);



  // Отображение состояний загрузки и ошибок
  if (isLoading && !partnersData) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка при загрузке партнеров: {getErrorMessage(error)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Отображение ошибок */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Заголовок и кнопки действий */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4">
          Партнеры
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/partners/new')}
        >
          Добавить партнера
        </Button>
      </Box>

      {/* Поиск */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Поиск по названию компании, контактному лицу или номеру телефона..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ 
            maxWidth: 400, 
            flexGrow: 1 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Статистика */}
      <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Найдено партнеров: <strong>{totalItems}</strong>
        </Typography>
        {partners.length > 0 && (
          <Typography variant="body2" color="success.main">
            Активных: <strong>{partners.filter(p => p.is_active).length}</strong>
          </Typography>
        )}
        {partners.filter(p => !p.is_active).length > 0 && (
          <Typography variant="body2" color="error.main">
            Неактивных: <strong>{partners.filter(p => !p.is_active).length}</strong>
          </Typography>
        )}
      </Box>

      {/* Таблица партнеров */}
      <TableContainer 
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Партнер</TableCell>
              <TableCell>Контактное лицо</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
            <TableBody>
              {partners.length > 0 ? (
                partners.map((partner: Partner) => (
                  <PartnerRow
                    key={partner.id}
                    partner={partner}
                    onEdit={handleEditPartner}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    getInitials={getPartnerInitials}
                    tablePageStyles={tablePageStyles}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {page > 0 ? "На этой странице нет данных" : "Нет данных для отображения"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      {Math.ceil(totalItems / pageSize) > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3
        }}>
          <Pagination
            count={Math.ceil(totalItems / pageSize)}
            page={page + 1}
            onChange={(newPage) => handlePageChange(newPage)}
            disabled={isLoading}
            color="primary"
          />
        </Box>
      )}

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Подтверждение удаления"
        actions={
          <>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
            >
              Удалить
            </Button>
          </>
        }
      >
        <Typography>
          Вы действительно хотите удалить этого партнера? Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default PartnersPage; 