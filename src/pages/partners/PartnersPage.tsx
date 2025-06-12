import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  InputAdornment,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useCreateTestPartnerMutation,
  useTogglePartnerActiveMutation,
} from '../../api';
import { Partner } from '../../types/models';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Pagination } from '../../components/ui/Pagination';
import { Chip } from '../../components/ui/Chip';

// Импорты централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles, getChipStyles } from '../../styles/components';
import { SIZES, getAdaptiveTableStyles } from '../../styles';

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
 * - Responsive дизайн с SIZES константами
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
  getInitials 
}: {
  partner: Partner;
  onEdit: (id: number) => void;
  onToggleStatus: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  getInitials: (partner: Partner) => string;
}) => {
  const theme = useTheme();
  const chipStyles = getChipStyles(theme);

  return (
    <TableRow key={partner.id}>
      <TableCell>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SIZES.spacing.sm 
        }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getInitials(partner)}
          </Avatar>
          <Box>
            <Typography 
              sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500 }}
            >
              {partner.company_name}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ fontSize: SIZES.fontSize.sm }}
            >
              {partner.company_description}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
          {partner.contact_person}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
          {partner.user?.phone}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
          {partner.user?.email}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={partner.is_active ? 'Активен' : 'Неактивен'}
          color={partner.is_active ? 'success' : 'error'}
          size="small"
          sx={{
            ...chipStyles,
            fontSize: SIZES.fontSize.xs,
          }}
        />
      </TableCell>

      <TableCell align="right">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: SIZES.spacing.xs 
        }}>
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
  const theme = useTheme(); // Инициализация темы для централизованных стилей
  
  // Адаптивность
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Централизованные стили
  const cardStyles = getCardStyles(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme);
  const tableStyles = getAdaptiveTableStyles(theme, isMobile, isTablet);

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    page,
    per_page: pageSize,
  }), [debouncedSearch, page, pageSize]);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading: partnersLoading, 
    error: partnersError 
  } = useGetPartnersQuery(queryParams);

  const [deletePartner, { isLoading: deleteLoading }] = useDeletePartnerMutation();
  const [createTestPartner, { isLoading: testPartnerLoading }] = useCreateTestPartnerMutation();
  const [togglePartnerActive, { isLoading: toggleLoading }] = useTogglePartnerActiveMutation();

  const isLoading = partnersLoading || deleteLoading || testPartnerLoading || toggleLoading;
  const error = partnersError as FetchBaseQueryError | SerializedError | undefined;
  const partners = partnersData?.data || [];

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
    setPage(1);
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
      } catch (error) {
        console.error('Ошибка при удалении партнера:', error);
      }
    }
  }, [selectedPartner, deletePartner]);

  const handleToggleStatus = useCallback(async (partner: Partner) => {
    try {
      await togglePartnerActive({
        id: partner.id,
        isActive: !partner.is_active
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
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

  const handleCreateTestPartner = useCallback(async () => {
    try {
      await createTestPartner().unwrap();
    } catch (error) {
      console.error('Ошибка при создании тестового партнера:', error);
    }
  }, [createTestPartner]);

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке партнеров: {getErrorMessage(error)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography 
          variant="h4"
          sx={{ fontSize: SIZES.fontSize.xl }}
        >
          Партнеры
        </Typography>
        <Box sx={{ display: 'flex', gap: SIZES.spacing.md }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCreateTestPartner}
            disabled={testPartnerLoading}
            sx={secondaryButtonStyles}
          >
            {testPartnerLoading ? 'Создание...' : 'Создать тестового партнера'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/partners/new')}
            sx={primaryButtonStyles}
          >
            Добавить партнера
          </Button>
        </Box>
      </Box>

      {/* Поиск */}
      <Box sx={{ 
        p: SIZES.spacing.md, 
        mb: SIZES.spacing.lg
      }}>
        <Box sx={{ display: 'flex', gap: SIZES.spacing.md }}>
          <TextField
            label="Поиск"
            placeholder="Поиск по названию компании, контактному лицу или номеру телефона..."
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            sx={textFieldStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Таблица партнеров */}
      <Box>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: SIZES.spacing.xl 
          }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: SIZES.spacing.lg }}>
            <Alert severity="error">
              Ошибка при загрузке партнеров: {getErrorMessage(error)}
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer sx={tableStyles.tableContainer}>
              <Table sx={tableStyles.table} aria-label="table of partners">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Партнер
                    </TableCell>
                    <TableCell sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Контактное лицо
                    </TableCell>
                    <TableCell sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Телефон
                    </TableCell>
                    <TableCell sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Статус
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: SIZES.fontSize.md, fontWeight: 600 }}>
                      Действия
                    </TableCell>
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
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" color="text.secondary">
                          {page > 1 ? "На этой странице нет данных" : "Нет данных для отображения"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: SIZES.spacing.md 
            }}>
              {partnersData?.pagination && partnersData.pagination.total_pages > 0 && (
                <Pagination
                  count={partnersData.pagination.total_pages}
                  page={Math.min(page, partnersData.pagination.total_pages)}
                  onChange={(newPage) => handlePageChange({} as React.ChangeEvent<unknown>, newPage)}
                  color="primary"
                  disabled={partnersData.pagination.total_pages <= 1}
                />
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Подтверждение удаления"
        actions={
          <>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={secondaryButtonStyles}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={primaryButtonStyles}
            >
              Удалить
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          Вы действительно хотите удалить этого партнера? Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default PartnersPage; 