import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { getTablePageStyles } from '../../styles/tablePageStyles';
import { Pagination } from '../../components/ui/Pagination/Pagination';
import Notification from '../../components/Notification';
import { ConfirmDialog } from '../../components/ConfirmDialog';

import {
  useGetAgreementsQuery,
  useDeleteAgreementMutation,
  Agreement,
} from '../../api/agreements.api';


const AgreementsPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние пагинации
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);

  // Состояние диалогов

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);

  // Состояние уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API хуки
  const {
    data: agreementsData,
    isLoading,
    error,
  } = useGetAgreementsQuery({
    page,
    per_page: rowsPerPage,
  });

  const [deleteAgreement, { isLoading: isDeleting }] = useDeleteAgreementMutation();

  // Обработчики событий


  const handleDeleteClick = (agreement: Agreement) => {
    setAgreementToDelete(agreement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agreementToDelete) return;

    try {
      await deleteAgreement(agreementToDelete.id).unwrap();
      setNotification({
        open: true,
        message: 'Договоренность успешно удалена',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setAgreementToDelete(null);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при удалении договоренности',
        severity: 'error',
      });
    }
  };



  // Функция для получения цвета статуса
  const getStatusColor = (active: boolean): 'success' | 'default' => {
    return active ? 'success' : 'default';
  };

  // Функция для получения цвета типа заказов
  const getOrderTypeColor = (orderType: string): 'primary' | 'secondary' | 'info' => {
    switch (orderType) {
      case 'cart_orders':
        return 'primary';
      case 'pickup_orders':
        return 'secondary';
      case 'both':
        return 'info';
      default:
        return 'primary';
    }
  };

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Typography color="error">
          Ошибка загрузки договоренностей
        </Typography>
      </Box>
    );
  }

  const agreements = agreementsData?.data || [];
  const totalCount = agreementsData?.meta?.total_count || 0;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
          Договоренности партнеров
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/agreements/new')}
          sx={tablePageStyles.addButton}
        >
          Создать договоренность
        </Button>
      </Box>

      {/* Таблица договоренностей */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Партнер</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Тип заказов</TableCell>
              <TableCell>Активность</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell>Дата изменения</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agreements.map((agreement) => (
              <TableRow key={agreement.id} hover>
                <TableCell>{agreement.id}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {agreement.partner_info.company_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agreement.partner_info.contact_person}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {agreement.supplier_info.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {agreement.supplier_info.firm_id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={agreement.order_types_text}
                    color={getOrderTypeColor(agreement.order_types)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={agreement.active_text}
                    color={getStatusColor(agreement.active)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{agreement.formatted_created_at}</TableCell>
                <TableCell>{agreement.formatted_start_date}</TableCell>
                <TableCell>{agreement.formatted_updated_at}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => navigate(`/admin/agreements/${agreement.id}/edit`)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(agreement)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(newPage) => setPage(newPage)}
          />
        </Box>
      )}



      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить договоренность "${agreementToDelete?.display_name}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setAgreementToDelete(null);
        }}

      />

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default AgreementsPage;