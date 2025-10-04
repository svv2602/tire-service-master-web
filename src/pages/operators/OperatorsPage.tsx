import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, TextField, Select, MenuItem, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid } from '../../components/ui';
import { FormControl, InputLabel, useTheme } from '@mui/material';;
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  PersonOff as PersonOffIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// API хуки
import {
  useGetAllOperatorsQuery,
  useGetOperatorsByPartnerQuery,
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
} from '../../api/operators.api';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useGetPartnersQuery } from '../../api/partners.api';

// Компоненты
import { Pagination } from '../../components/ui/Pagination';
import { LoadingScreen } from '../../components/LoadingScreen';
import { OperatorModal } from '../../components/partners/OperatorModal';
import { OperatorAssignmentModal } from '../../components/ui/OperatorAssignmentModal';

// Типы
import type { Operator } from '../../api/operators.api';

const OperatorsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Хук для управления правами доступа по ролям
  const { isPartner, partnerId, debugInfo } = useRoleAccess();
  
  // Отладочная информация
  console.log('OperatorsPage DEBUG:', { isPartner, partnerId, typeof: typeof partnerId, debugInfo });

  // Состояние для фильтров и поиска
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Состояние для модальных окон
  const [operatorModal, setOperatorModal] = useState<{
    open: boolean;
    operator: Operator | null;
  }>({
    open: false,
    operator: null,
  });

  const [assignmentModal, setAssignmentModal] = useState<{
    open: boolean;
    operator: Operator | null;
  }>({
    open: false,
    operator: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    operator: Operator | null;
  }>({
    open: false,
    operator: null,
  });

  // API запросы - разная логика для партнеров и админов
  const {
    data: partnerOperatorsData,
    isLoading: partnerOperatorsLoading,
    refetch: refetchPartnerOperators,
  } = useGetOperatorsByPartnerQuery(partnerId || 0, {
    skip: !isPartner || !partnerId,
  });

  const {
    data: allOperatorsData,
    isLoading: allOperatorsLoading,
    refetch: refetchAllOperators,
  } = useGetAllOperatorsQuery({
    page,
    per_page: rowsPerPage,
    search: search || undefined,
    partner_id: partnerFilter || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
  }, {
    skip: isPartner && !!partnerId,
  });

  // Выбираем правильные данные в зависимости от роли
  const operatorsData = isPartner && partnerId ? 
    (partnerOperatorsData ? {
      data: partnerOperatorsData,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: partnerOperatorsData.length,
        per_page: partnerOperatorsData.length
      }
    } : undefined) : 
    allOperatorsData;

  const operatorsLoading = isPartner && partnerId ? partnerOperatorsLoading : allOperatorsLoading;
  const refetchOperators = isPartner && partnerId ? refetchPartnerOperators : refetchAllOperators;
  
  console.log('OperatorsPage API Query Result:', { isPartner, partnerId, operatorsData });

  const { data: partnersData } = useGetPartnersQuery({
    page: 1,
    per_page: 100,
  });

  const [createOperator] = useCreateOperatorMutation();
  const [updateOperator] = useUpdateOperatorMutation();
  const [deleteOperator] = useDeleteOperatorMutation();

  // Обработка данных
  const operators = operatorsData?.data || [];
  const pagination = operatorsData?.pagination;
  const partners = partnersData?.data || [];

  // Обработчики
  const handleCreateOperator = () => {
    setOperatorModal({ open: true, operator: null });
  };

  const handleSaveOperator = async (data: any) => {
    try {
      if (operatorModal.operator) {
        // Редактирование
        await updateOperator({
          id: operatorModal.operator.id,
          data,
        }).unwrap();
      } else {
        // Создание - нужен partner_id
        const targetPartnerId = isPartner ? partnerId : partnerFilter;
        if (!targetPartnerId) {
          throw new Error(isPartner ? 'Ошибка: не найден ID партнера' : 'Выберите партнера для создания оператора');
        }
        await createOperator({
          partnerId: targetPartnerId as number,
          data,
        }).unwrap();
      }
      setOperatorModal({ open: false, operator: null });
      refetchOperators();
    } catch (error) {
      console.error('Ошибка при сохранении оператора:', error);
      throw error;
    }
  };

  const handleDeleteOperator = async () => {
    if (!deleteDialog.operator) return;

    try {
      await deleteOperator({
        id: deleteDialog.operator.id,
        partnerId: deleteDialog.operator.partner_id,
      }).unwrap();
      setDeleteDialog({ open: false, operator: null });
      refetchOperators();
    } catch (error) {
      console.error('Ошибка при удалении оператора:', error);
    }
  };

  if (operatorsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок страницы */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/admin')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">
              Управление операторами
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOperator}
            disabled={!isPartner && !partnerFilter} // Партнеры всегда могут создавать, остальные только после выбора партнера
          >
            Добавить оператора
          </Button>
        </Box>

        {/* Фильтры */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск по имени, email или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>

          {/* Фильтр партнеров - только для админов и менеджеров */}
          {!isPartner && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Партнер</InputLabel>
                <Select
                  value={partnerFilter}
                  onChange={(e) => setPartnerFilter(e.target.value as number | '')}
                  label="Партнер"
                >
                  <MenuItem value="">Все партнеры</MenuItem>
                  {partners.map((partner) => (
                    <MenuItem key={partner.id} value={partner.id}>
                      {partner.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                label="Статус"
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="inactive">Неактивные</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Информационное сообщение (только для админов) */}
      {!partnerFilter && !isPartner && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Выберите партнера для просмотра и управления его операторами. 
          Для создания нового оператора также необходимо выбрать партнера.
        </Alert>
      )}

      {/* Таблица операторов */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ФИО</TableCell>
                <TableCell>Партнер</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Сервисные точки</TableCell>
                <TableCell>Уровень доступа</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {search || partnerFilter ? 'Операторы не найдены' : 'Нет операторов'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {search || partnerFilter 
                        ? 'Попробуйте изменить критерии поиска'
                        : 'Выберите партнера для просмотра операторов'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {operator.user.full_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {operator.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operator.partner_name || 'Не указан'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operator.position || 'Не указано'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operator.user.phone || 'Не указан'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {operator.service_point_ids && operator.service_point_ids.length > 0 ? (
                        <Chip
                          size="small"
                          label={`${operator.service_point_ids.length} точек`}
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Не назначен
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`Уровень ${operator.access_level}`}
                        color={operator.access_level >= 4 ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={operator.is_active ? 'Активен' : 'Неактивен'}
                        color={operator.is_active ? 'success' : 'error'}
                        variant="filled"
                        icon={operator.is_active ? <PersonIcon /> : <PersonOffIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setOperatorModal({ open: true, operator })}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setAssignmentModal({ open: true, operator })}
                          color="info"
                        >
                          <AssignmentIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, operator })}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Пагинация */}
      {pagination && pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.total_pages}
            page={pagination.current_page}
            onChange={(newPage) => setPage(newPage)}
            disabled={operatorsLoading}
          />
        </Box>
      )}

      {/* Модальное окно создания/редактирования оператора */}
      <OperatorModal
        open={operatorModal.open}
        onClose={() => setOperatorModal({ open: false, operator: null })}
        onSave={handleSaveOperator}
        operator={operatorModal.operator}
      />

      {/* Модальное окно управления назначениями */}
      {assignmentModal.operator && (
        <OperatorAssignmentModal
          open={assignmentModal.open}
          onClose={() => setAssignmentModal({ open: false, operator: null })}
          operator={assignmentModal.operator}
          onAssignmentSuccess={() => {
            refetchOperators();
            setAssignmentModal({ open: false, operator: null });
          }}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, operator: null })}
      >
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить оператора{' '}
            <strong>{deleteDialog.operator?.user.full_name}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            При наличии связанных записей оператор будет деактивирован, 
            иначе будет удален полностью.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, operator: null })}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteOperator}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperatorsPage; 