import React, { useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchPartners, deletePartner, togglePartnerActive, clearSelectedPartner } from '../../store/slices/partnersSlice';
import { useNavigate } from 'react-router-dom';
import { Partner } from '../../types/models';
import { partnersApi } from '../../api/partners';

interface ApiError {
  message?: string;
  error?: string;
}

const PartnersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { partners, loading: partnersLoading, error: partnersError } = useSelector((state: RootState) => state.partners);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('company_name');
  const [partnerToDelete, setPartnerToDelete] = useState<number | null>(null);
  const [partnerToDeleteName, setPartnerToDeleteName] = useState<string>('');
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false);
  const [partnerToToggle, setPartnerToToggle] = useState<{ id: number, is_active: boolean, name: string } | null>(null);

  const filteredPartners = React.useMemo(() => {
    if (!partners) return [];
    return partners.filter(partner => 
      partner.company_name.toLowerCase().includes(search.toLowerCase()) ||
      partner.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      partner.email?.toLowerCase().includes(search.toLowerCase()) ||
      partner.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  const loadPartners = useCallback(() => {
    dispatch(fetchPartners({
      query: search || undefined,
      sort_by: sortBy,
    }));
  }, [dispatch, search, sortBy]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleError = (error: unknown): string => {
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      if ('error' in error && typeof error.error === 'string') {
        return error.error;
      }
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Произошла неизвестная ошибка';
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого партнера?')) {
      try {
        setLoading(true);
        setDeleteError(null);
        await dispatch(deletePartner(id)).unwrap();
        setPartnerToDelete(null);
        loadPartners();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        const errorMessage = handleError(error);
        setDeleteError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean, name: string) => {
    setPartnerToToggle({ id, is_active: currentStatus, name });
    setToggleError(null);
    setToggleActiveDialogOpen(true);
  };

  const handleConfirmToggleActive = () => {
    if (partnerToToggle) {
      dispatch(togglePartnerActive({ 
        id: partnerToToggle.id, 
        active: !partnerToToggle.is_active 
      }))
        .unwrap()
        .then(() => {
          setToggleActiveDialogOpen(false);
          setPartnerToToggle(null);
          loadPartners();
        })
        .catch((error) => {
          setToggleError(typeof error === 'string' ? error : 'Произошла ошибка при изменении статуса партнера');
        });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Партнеры</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/partners/new')}
        >
          Добавить партнера
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Поиск по названию компании, контактному лицу, email или телефону"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Компания</TableCell>
                <TableCell>Контактное лицо</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Регион/Город</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <Typography variant="subtitle1">{partner.company_name}</Typography>
                    {partner.website && (
                      <Typography variant="body2" color="textSecondary">
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          {partner.website}
                        </a>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{partner.contact_person}</TableCell>
                  <TableCell>
                    <Box>
                      {partner.email && (
                        <Typography variant="body2">
                          Email: {partner.email}
                        </Typography>
                      )}
                      {partner.phone && (
                        <Typography variant="body2">
                          Тел.: {partner.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {partner.region?.name && (
                      <Typography variant="body2">
                        {partner.region.name}
                      </Typography>
                    )}
                    {partner.city?.name && (
                      <Typography variant="body2" color="textSecondary">
                        {partner.city.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={partner.is_active ? 'Активен' : 'Неактивен'}
                      color={partner.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={partner.is_active ? 'Деактивировать' : 'Активировать'}>
                      <IconButton
                        onClick={() => handleToggleActive(partner.id, partner.is_active, partner.company_name)}
                        color={partner.is_active ? 'success' : 'default'}
                      >
                        {partner.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/partners/${partner.id}/edit`)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDelete(partner.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!partnerToDelete} onClose={() => setPartnerToDelete(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить партнера "{partnerToDeleteName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие удалит партнера и все связанные с ним данные, включая учетную запись пользователя.
            Данное действие нельзя отменить.
          </Typography>
          
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          {deleteError && deleteError.includes('сервисные точки') && (
            <Box sx={{ mt: 2, bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="error">
                Сначала необходимо удалить сервисные точки, связанные с этим партнером.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnerToDelete(null)}>Отмена</Button>
          <Button 
            onClick={() => handleDelete(partnerToDelete!)} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения изменения статуса */}
      <Dialog open={toggleActiveDialogOpen} onClose={() => {
        setToggleActiveDialogOpen(false);
        setPartnerToToggle(null);
      }}>
        <DialogTitle>Подтверждение изменения статуса</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите {partnerToToggle?.is_active ? "деактивировать" : "активировать"} партнера "{partnerToToggle?.name}"?
          </Typography>
          <Box sx={{ mt: 1 }}>
            {partnerToToggle?.is_active ? (
              <>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  При деактивации партнера:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Все сервисные точки партнера будут переведены в статус "Временно закрыты"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Пользователь партнера и все его менеджеры будут переведены в роль "Клиент"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Они сохранят доступ к системе, но только с правами клиента
                    </Typography>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  При активации партнера:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Сервисные точки вернутся в активный статус
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Пользователь партнера вернет роль "Партнер"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary">
                      Менеджеры останутся с ролью "Клиент" и потребуют ручного восстановления их ролей
                    </Typography>
                  </li>
                </ul>
              </>
            )}
          </Box>
          
          {toggleError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {toggleError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setToggleActiveDialogOpen(false);
            setPartnerToToggle(null);
          }}>Отмена</Button>
          <Button 
            onClick={handleConfirmToggleActive} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Изменить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage;