import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Alert,
  Chip,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  Assignment as ApplicationIcon,
  Delete as DeleteIcon,
  Business as CompanyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Импорты API и типов
import {
  useGetPartnerApplicationsQuery,
  useUpdatePartnerApplicationStatusMutation,
  useDeletePartnerApplicationMutation,
} from '../../api/partnerApplications.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { PartnerApplication, PartnerApplicationStatus } from '../../types/PartnerApplication';

// Импорт хука для проверки прав доступа
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { getTablePageStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';
import Notification from '../../components/Notification';
import ApplicationDetailsDialog from './components/ApplicationDetailsDialog';
import { ActionsMenu } from '../../components/ui';
import type { ActionItem } from '../../components/ui';

const PartnerApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const { isAdmin, isManager } = useRoleAccess();

  // Состояние компонента
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Состояние для диалогов
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    application: PartnerApplication | null;
  }>({
    open: false,
    application: null,
  });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    application: PartnerApplication | null;
  }>({
    open: false,
    application: null,
  });
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    application: PartnerApplication | null;
  }>({
    open: false,
    application: null,
  });
  const [newStatus, setNewStatus] = useState<PartnerApplicationStatus>('new');

  // API запросы
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetPartnerApplicationsQuery({
    page: page + 1,
    per_page: rowsPerPage,
    ...(statusFilter && { status: statusFilter as PartnerApplicationStatus }),
    ...(regionFilter && { region_id: parseInt(regionFilter) }),
  });

  const { data: regionsData } = useGetRegionsQuery({});

  // Мутации
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePartnerApplicationStatusMutation();
  const [deleteApplication, { isLoading: isDeleting }] = useDeletePartnerApplicationMutation();

  // Проверка доступа
  if (!isAdmin && !isManager) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          {t('partnerApplications.messages.accessDenied')}
        </Alert>
      </Box>
    );
  }

  // Данные для таблицы
  const applications = applicationsData?.data || [];
  const totalCount = applicationsData?.pagination?.total_count || 0;

  // Функции для работы со статусами
  const getStatusColor = (status: PartnerApplicationStatus) => {
    switch (status) {
      case 'new': return 'warning';
      case 'in_progress': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'connected': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: PartnerApplicationStatus) => {
    return t(`partnerApplications.statusLabels.${status}`) || status;
  };

  // Обработчики событий
  const handleStatusUpdate = async (application: PartnerApplication, status: PartnerApplicationStatus) => {
    try {
      await updateStatus({
        id: application.id,
        status: status,
        admin_notes: adminNotes,
      }).unwrap();

      setNotification({
        open: true,
        message: t('partnerApplications.messages.statusUpdated'),
        severity: 'success',
      });

      setStatusChangeDialog({ open: false, application: null });
      setAdminNotes('');
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: t('partnerApplications.messages.statusUpdateError'),
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.application) return;

    try {
      await deleteApplication(deleteDialog.application.id).unwrap();

      setNotification({
        open: true,
        message: t('partnerApplications.messages.applicationDeleted'),
        severity: 'success',
      });

      setDeleteDialog({ open: false, application: null });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: t('partnerApplications.messages.deleteError'),
        severity: 'error',
      });
    }
  };



  const handleDeleteClick = (application: PartnerApplication) => {
    setDeleteDialog({
      open: true,
      application,
    });
  };

  const handleViewDetails = (application: PartnerApplication) => {
    setViewDialog({
      open: true,
      application,
    });
  };

  const handleChangeStatus = (application: PartnerApplication) => {
    setStatusChangeDialog({
      open: true,
      application,
    });
    setNewStatus(application.status);
  };

  // Конфигурация действий для ActionsMenu
  const applicationActions: ActionItem<PartnerApplication>[] = [
    {
      id: 'view',
      label: t('partnerApplications.actions.view'),
      icon: <ViewIcon />,
      onClick: handleViewDetails,
      color: 'primary',
    },
    {
      id: 'change-status',
      label: t('partnerApplications.actions.changeStatus'),
      icon: <EditIcon />,
      onClick: handleChangeStatus,
      color: 'info',
    },
    ...(isAdmin ? [{
      id: 'delete',
      label: t('partnerApplications.actions.delete'),
      icon: <DeleteIcon />,
      onClick: handleDeleteClick,
      color: 'error' as const,
      requireConfirmation: true,
      confirmationConfig: {
        title: t('partnerApplications.dialogs.delete.title'),
        message: t('partnerApplications.dialogs.delete.message'),
        confirmLabel: t('partnerApplications.dialogs.delete.delete'),
        cancelLabel: t('partnerApplications.dialogs.delete.cancel'),
      }
    }] : [])
  ];

  if (isLoading) {
    return (
      <Box sx={{ ...tablePageStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

      if (error) {
      return (
        <Box sx={tablePageStyles.pageContainer}>
                            <Alert severity="error">
            {t('partnerApplications.messages.loadingError')}
          </Alert>
        </Box>
      );
    }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ApplicationIcon sx={{ mr: 2, fontSize: '2rem', color: theme.palette.primary.main }} />
        <Typography variant="h4" component="h1">
          {t('partnerApplications.title')}
        </Typography>
      </Box>

      {/* Фильтры */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('partnerApplications.filters.status')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('partnerApplications.filters.status')}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">{t('partnerApplications.filters.allStatuses')}</MenuItem>
            <MenuItem value="new">{t('partnerApplications.statuses.new')}</MenuItem>
            <MenuItem value="pending">{t('partnerApplications.statuses.pending')}</MenuItem>
            <MenuItem value="in_progress">{t('partnerApplications.statuses.in_progress')}</MenuItem>
            <MenuItem value="approved">{t('partnerApplications.statuses.approved')}</MenuItem>
            <MenuItem value="rejected">{t('partnerApplications.statuses.rejected')}</MenuItem>
            <MenuItem value="connected">{t('partnerApplications.statuses.connected')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('partnerApplications.filters.region')}</InputLabel>
          <Select
            value={regionFilter}
            label={t('partnerApplications.filters.region')}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <MenuItem value="">{t('partnerApplications.filters.allRegions')}</MenuItem>
            {(regionsData?.data || []).map((region) => (
              <MenuItem key={region.id} value={region.id.toString()}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('partnerApplications.table.company')}</TableCell>
              <TableCell>{t('partnerApplications.table.contacts')}</TableCell>
              <TableCell>{t('partnerApplications.table.location')}</TableCell>
              <TableCell>{t('partnerApplications.table.status')}</TableCell>
              <TableCell align="center">{t('partnerApplications.table.servicePoints')}</TableCell>
              <TableCell>{t('partnerApplications.table.dateSubmitted')}</TableCell>
              <TableCell align="center">{t('partnerApplications.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompanyIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {application.company_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {application.contact_person}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <EmailIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                      <Typography variant="caption">{application.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                      <Typography variant="caption">{application.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                    <Typography variant="caption">
                      {application.region?.name}, {application.city}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(application.status)}
                    color={getStatusColor(application.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {application.expected_service_points}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {application.created_at ? (() => {
                      try {
                        const date = new Date(application.created_at);
                        return isNaN(date.getTime()) ? application.created_at : date.toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        });
                      } catch (error) {
                        return application.created_at;
                      }
                    })() : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <ActionsMenu 
                    actions={applicationActions} 
                    item={application} 
                    menuThreshold={1}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {applications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {t('partnerApplications.empty.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('partnerApplications.empty.description')}
          </Typography>
        </Box>
      )}

      {/* Диалог изменения статуса */}
      <Dialog open={statusChangeDialog.open} onClose={() => setStatusChangeDialog({ open: false, application: null })}>
        <DialogTitle>
          {t('partnerApplications.dialogs.changeStatus.title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('partnerApplications.dialogs.changeStatus.application')} <strong>{statusChangeDialog.application?.company_name}</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>{t('partnerApplications.dialogs.changeStatus.newStatus')}</InputLabel>
            <Select
              value={newStatus}
              label={t('partnerApplications.dialogs.changeStatus.newStatus')}
              onChange={(e) => setNewStatus(e.target.value as PartnerApplicationStatus)}
            >
              <MenuItem value="new">{t('partnerApplications.statusLabels.new')}</MenuItem>
              <MenuItem value="pending">{t('partnerApplications.statusLabels.pending')}</MenuItem>
              <MenuItem value="in_progress">{t('partnerApplications.statusLabels.in_progress')}</MenuItem>
              <MenuItem value="approved">{t('partnerApplications.statusLabels.approved')}</MenuItem>
              <MenuItem value="rejected">{t('partnerApplications.statusLabels.rejected')}</MenuItem>
              <MenuItem value="connected">{t('partnerApplications.statusLabels.connected')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('partnerApplications.dialogs.changeStatus.adminComment')}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={t('partnerApplications.dialogs.changeStatus.adminCommentPlaceholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeDialog({ open: false, application: null })}>
            {t('partnerApplications.dialogs.changeStatus.cancel')}
          </Button>
          <Button 
            onClick={() => {
              if (statusChangeDialog.application) {
                handleStatusUpdate(statusChangeDialog.application, newStatus);
              }
            }} 
            variant="contained"
            disabled={isUpdatingStatus}
            color="primary"
          >
            {isUpdatingStatus 
              ? t('partnerApplications.dialogs.changeStatus.saving')
              : t('partnerApplications.dialogs.changeStatus.confirm')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, application: null })}>
        <DialogTitle>{t('partnerApplications.dialogs.delete.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('partnerApplications.dialogs.delete.message')} <strong>{deleteDialog.application?.company_name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.error.main }}>
            {t('partnerApplications.dialogs.delete.warning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, application: null })}>
            {t('partnerApplications.dialogs.delete.cancel')}
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            disabled={isDeleting}
          >
            {isDeleting 
              ? t('partnerApplications.dialogs.delete.deleting')
              : t('partnerApplications.dialogs.delete.delete')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра деталей */}
      <ApplicationDetailsDialog
        open={viewDialog.open}
        application={viewDialog.application}
        onClose={() => setViewDialog({ open: false, application: null })}
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

export default PartnerApplicationsPage; 