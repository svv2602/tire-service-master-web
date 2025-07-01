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
 * - Централизованная система стилей для консистентного UI
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
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
  useGetPartnerRelatedDataQuery,
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
  Table,
  type Column,
} from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

// Импорты централизованных стилей
import { getTablePageStyles } from '../../styles/components';

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
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const [deletePartner] = useDeletePartnerMutation();
  const [togglePartnerActive] = useTogglePartnerActiveMutation();
  
  // Запрос связанных данных для выбранного партнера (только при открытии диалога деактивации)
  const { data: relatedData, isLoading: relatedDataLoading } = useGetPartnerRelatedDataQuery(
    selectedPartner?.id || 0,
    { skip: !selectedPartner?.id || !deactivateDialogOpen }
  );

  const partners = partnersData?.data || [];
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
    if (partner.is_active) {
      // Если партнер активен, показываем диалог деактивации
      setDeactivateDialogOpen(true);
    } else {
      // Если партнер неактивен, показываем обычный диалог удаления
      setDeleteDialogOpen(true);
    }
  }, []);

  const handleEditPartner = useCallback((id: number) => {
    navigate(`/admin/partners/${id}/edit`);
  }, [navigate]);

  const handleDeactivateConfirm = useCallback(async () => {
    if (selectedPartner) {
      try {
        const response = await deletePartner(selectedPartner.id).unwrap();
        
        // Проверяем, была ли выполнена деактивация вместо удаления
        if (response && typeof response === 'object' && 'action' in response && response.action === 'deactivated') {
          setErrorMessage(null);
          setDeactivateDialogOpen(false);
          setSelectedPartner(null);
          // Показываем информационное сообщение о деактивации
          setSuccessMessage(response.message || 'Партнер был деактивирован. Теперь вы можете его удалить.');
          return;
        }
        
        // Если вернулось что-то другое, закрываем диалог
        setDeactivateDialogOpen(false);
        setSelectedPartner(null);
        setErrorMessage(null);
        setSuccessMessage('Партнер успешно деактивирован.');
      } catch (error: any) {
        let errorMessage = 'Ошибка при деактивации партнера';
        
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
        setDeactivateDialogOpen(false);
      }
    }
  }, [selectedPartner, deletePartner]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedPartner) {
      try {
        await deletePartner(selectedPartner.id).unwrap();
        
        // Обычное удаление
        setDeleteDialogOpen(false);
        setSelectedPartner(null);
        setErrorMessage(null);
        setSuccessMessage('Партнер успешно удален.');
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
      setErrorMessage(null);
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

  // Конфигурация колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'company',
      label: 'Партнер',
      wrap: true,
      format: (value, row: Partner) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getPartnerInitials(row)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {row.company_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.company_description}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'contact_person',
      label: 'Контактное лицо',
      wrap: true,
      format: (value, row: Partner) => (
        <Typography variant="body2">
          {row.contact_person}
        </Typography>
      )
    },
    {
      id: 'phone',
      label: 'Телефон',
      format: (value, row: Partner) => (
        <Typography variant="body2">
          {row.user?.phone || 'Не указан'}
        </Typography>
      )
    },
    {
      id: 'email',
      label: 'Email',
      format: (value, row: Partner) => (
        <Typography variant="body2">
          {row.user?.email || 'Не указан'}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value, row: Partner) => (
        <Chip
          label={row.is_active ? 'Активен' : 'Неактивен'}
          color={row.is_active ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      format: (value, row: Partner) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton
              onClick={() => handleEditPartner(row.id)}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [tablePageStyles, getPartnerInitials, handleEditPartner, handleDeleteClick]);

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
      {/* Отображение ошибок и успешных сообщений */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}
      
      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Box>
      )}

      {/* Заголовок и кнопки действий */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Партнеры
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/partners/new')}
          sx={tablePageStyles.createButton}
        >
          Добавить партнера
        </Button>
      </Box>

      {/* Поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по названию компании, контактному лицу или номеру телефона..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={tablePageStyles.searchField}
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
      <Box sx={tablePageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={partners}
        />
        
        {/* Пагинация */}
        {Math.ceil(totalItems / pageSize) > 1 && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Pagination
              count={Math.ceil(totalItems / pageSize)}
              page={page + 1}
              onChange={handlePageChange}
              disabled={isLoading}
            />
          </Box>
        )}
      </Box>

      {/* Модальное окно подтверждения деактивации */}
      <Modal
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
        title="Подтверждение деактивации партнера"
        actions={
          <>
            <Button 
              onClick={() => setDeactivateDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleDeactivateConfirm} 
              color="warning" 
              variant="contained"
              disabled={relatedDataLoading}
            >
              Деактивировать
            </Button>
          </>
        }
      >
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Деактивация партнера <strong>"{selectedPartner?.company_name}"</strong>
          </Typography>
          
          {relatedDataLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography>Загрузка связанных данных...</Typography>
            </Box>
          ) : relatedData ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                При деактивации партнера будут также деактивированы:
              </Typography>
              
              {relatedData.service_points_count > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🏢 Сервисные точки ({relatedData.service_points_count}):
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {relatedData.service_points.map(sp => (
                      <Typography key={sp.id} variant="body2" color={sp.is_active ? 'text.primary' : 'text.secondary'}>
                        • {sp.name} {!sp.is_active && '(уже неактивна)'}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              
              {relatedData.operators_count > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    👥 Сотрудники ({relatedData.operators_count}):
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {relatedData.operators.map(op => (
                      <Typography key={op.id} variant="body2">
                        • {op.user.first_name} {op.user.last_name} ({op.user.email})
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              
              {relatedData.service_points_count === 0 && relatedData.operators_count === 0 && (
                <Typography variant="body2" color="text.secondary">
                  У этого партнера нет связанных сервисных точек или сотрудников.
                </Typography>
              )}
              
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Вы уверены, что хотите продолжить?
              </Typography>
            </Box>
          ) : (
            <Typography>Не удалось загрузить информацию о связанных данных.</Typography>
          )}
        </Box>
      </Modal>

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
          Вы действительно хотите удалить партнера <strong>"{selectedPartner?.company_name}"</strong>? 
          <br /><br />
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default PartnersPage;