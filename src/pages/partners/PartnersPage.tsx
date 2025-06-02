import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useUpdatePartnerMutation,
  useCreateTestPartnerMutation,
  useTogglePartnerActiveMutation,
} from '../../api';
import { Partner, PartnerFilter, PartnerFormData } from '../../types/models';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

// Хук для debounce
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

// Мемоизированный компонент строки партнера
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
}) => (
  <TableRow key={partner.id}>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {getInitials(partner)}
        </Avatar>
        <Box>
          <Typography>{partner.company_name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {partner.company_description}
          </Typography>
        </Box>
      </Box>
    </TableCell>

    <TableCell>{partner.contact_person}</TableCell>
    <TableCell>{partner.user?.phone}</TableCell>
    <TableCell>{partner.user?.email}</TableCell>

    <TableCell>
      <Chip
        icon={partner.is_active ? <CheckIcon /> : <CloseIcon />}
        label={partner.is_active ? 'Активен' : 'Неактивен'}
        color={partner.is_active ? 'success' : 'error'}
        size="small"
      />
    </TableCell>

    <TableCell align="right">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(partner.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={partner.is_active ? 'Деактивировать' : 'Активировать'}>
          <IconButton
            onClick={() => onToggleStatus(partner)}
            size="small"
            color={partner.is_active ? 'error' : 'success'}
          >
            {partner.is_active ? <CloseIcon /> : <CheckIcon />}
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
));

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

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
  const [updatePartner] = useUpdatePartnerMutation();
  const [createTestPartner, { isLoading: testPartnerLoading }] = useCreateTestPartnerMutation();
  const [togglePartnerActive, { isLoading: toggleLoading }] = useTogglePartnerActiveMutation();

  const isLoading = partnersLoading || deleteLoading || testPartnerLoading || toggleLoading;
  const error = partnersError as FetchBaseQueryError | SerializedError | undefined;
  const partners = partnersData?.data || [];
  const totalItems = partnersData?.pagination?.total_count || 0;

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

  const handleCloseDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedPartner(null);
  }, []);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Партнеры</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCreateTestPartner}
            disabled={testPartnerLoading}
          >
            {testPartnerLoading ? 'Создание...' : 'Создать тестового партнера'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/partners/new')}
          >
            Добавить партнера
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Ошибка при загрузке партнеров: {getErrorMessage(error)}
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="table of partners">
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              {partnersData?.pagination && partnersData.pagination.total_pages > 0 && (
                <Pagination
                  count={partnersData.pagination.total_pages}
                  page={Math.min(page, partnersData.pagination.total_pages)}
                  onChange={handlePageChange}
                  color="primary"
                  disabled={partnersData.pagination.total_pages <= 1}
                />
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы действительно хотите удалить этого партнера? Это действие нельзя будет отменить.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage; 