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
  TablePagination,
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
} from '../../api';
import { Partner, PartnerFilter, PartnerFormData } from '../../types/models';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  }), [debouncedSearch, page, rowsPerPage]);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading: partnersLoading, 
    error: partnersError 
  } = useGetPartnersQuery(queryParams);

  const [deletePartner, { isLoading: deleteLoading }] = useDeletePartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();

  const isLoading = partnersLoading || deleteLoading;
  const error = partnersError;
  const partners = partnersData?.data || [];
  const totalItems = partnersData?.meta?.total_count || 0;

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      await updatePartner({
        id: partner.id,
        partner: { is_active: !partner.is_active } as Partial<PartnerFormData>
        }).unwrap();
      } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  }, [updatePartner]);

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

  const handleAddPartner = useCallback(() => {
    navigate('/partners/new');
  }, [navigate]);

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
          Ошибка при загрузке партнеров: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Партнеры</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPartner}
        >
          Добавить партнера
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
      <TextField
          placeholder="Поиск по названию компании"
        variant="outlined"
          size="small"
        value={search}
        onChange={handleSearchChange}
          sx={{ minWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      </Paper>

      {/* Таблица партнеров */}
      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Компания</TableCell>
                <TableCell>Контактное лицо</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {partners.map((partner: Partner) => (
              <PartnerRow
                key={partner.id}
                partner={partner}
                onEdit={handleEditPartner}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
                getInitials={getPartnerInitials}
              />
            ))}
            </TableBody>
          </Table>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить партнера {selectedPartner?.company_name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage; 