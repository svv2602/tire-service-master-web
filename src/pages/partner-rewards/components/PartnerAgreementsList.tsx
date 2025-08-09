import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  Settings,
  Visibility,
  PlayArrow,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import {
  useGetAgreementsQuery,
  useGetAvailableSuppliersQuery,
  useCreateAgreementMutation,
  useUpdateAgreementMutation,
  useDeleteAgreementMutation,
  useGetRulesQuery,
  PartnerSupplierAgreement,
  CreateAgreementData,
} from '../../../api/partnerRewards.api';
import RewardRulesManager from './RewardRulesManager';

const PartnerAgreementsList: React.FC = () => {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    agreement: PartnerSupplierAgreement | null;
  }>({
    open: false,
    agreement: null,
  });
  const [rulesDialog, setRulesDialog] = useState<{
    open: boolean;
    agreementId: number | null;
  }>({
    open: false,
    agreementId: null,
  });
  const [formData, setFormData] = useState<CreateAgreementData>({
    supplier_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    commission_type: 'custom',
    active: true,
    description: '',
  });

  const {
    data: agreementsData,
    isLoading: isLoadingAgreements,
    error: agreementsError,
  } = useGetAgreementsQuery({});

  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
  } = useGetAvailableSuppliersQuery();

  const [createAgreement, { isLoading: isCreating }] = useCreateAgreementMutation();
  const [updateAgreement, { isLoading: isUpdating }] = useUpdateAgreementMutation();
  const [deleteAgreement] = useDeleteAgreementMutation();

  const agreements = agreementsData?.data || [];
  const suppliers = suppliersData?.data || [];

  const handleCreateAgreement = async () => {
    if (formData.supplier_id === 0) {
      alert('Выберите поставщика');
      return;
    }

    try {
      await createAgreement(formData).unwrap();
      setCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Ошибка создания договоренности:', error);
    }
  };

  const handleUpdateAgreement = async () => {
    if (!editDialog.agreement) return;

    try {
      await updateAgreement({
        id: editDialog.agreement.id,
        data: formData,
      }).unwrap();
      setEditDialog({ open: false, agreement: null });
      resetForm();
    } catch (error) {
      console.error('Ошибка обновления договоренности:', error);
    }
  };

  const handleDeleteAgreement = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту договоренность?')) {
      try {
        await deleteAgreement(id).unwrap();
      } catch (error) {
        console.error('Ошибка удаления договоренности:', error);
      }
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialog(true);
  };

  const openEditDialog = (agreement: PartnerSupplierAgreement) => {
    setFormData({
      supplier_id: agreement.supplier_id,
      start_date: agreement.start_date,
      end_date: agreement.end_date || '',
      commission_type: agreement.commission_type,
      active: agreement.active,
      description: agreement.description || '',
    });
    setEditDialog({ open: true, agreement });
  };

  const openRulesDialog = (agreementId: number) => {
    setRulesDialog({ open: true, agreementId });
  };

  const resetForm = () => {
    setFormData({
      supplier_id: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      commission_type: 'custom',
      active: true,
      description: '',
    });
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : `Поставщик #${supplierId}`;
  };

  const getStatusColor = (agreement: PartnerSupplierAgreement) => {
    if (!agreement.active) return 'default';
    if (!agreement.current) return 'warning';
    return 'success';
  };

  if (agreementsError) {
    return (
      <Alert severity="error">
        Ошибка загрузки договоренностей
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Box>
        {/* Заголовок и кнопка создания */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            🤝 Договоренности с поставщиками ({agreements.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            disabled={isLoadingSuppliers}
          >
            Новая договоренность
          </Button>
        </Box>

        {/* Список договоренностей */}
        {isLoadingAgreements ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : agreements.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🤝 Нет договоренностей с поставщиками
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Создайте первую договоренность, чтобы начать получать вознаграждения
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
              >
                Создать договоренность
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {agreements.map((agreement) => (
              <Grid item xs={12} key={agreement.id}>
                <AgreementCard
                  agreement={agreement}
                  supplierName={getSupplierName(agreement.supplier_id)}
                  onEdit={() => openEditDialog(agreement)}
                  onDelete={() => handleDeleteAgreement(agreement.id)}
                  onManageRules={() => openRulesDialog(agreement.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Диалог создания договоренности */}
        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Новая договоренность с поставщиком</DialogTitle>
          <DialogContent>
            <AgreementForm
              formData={formData}
              setFormData={setFormData}
              suppliers={suppliers}
              isLoading={isLoadingSuppliers}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreateAgreement}
              variant="contained"
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={20} /> : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования договоренности */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, agreement: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Редактирование договоренности #{editDialog.agreement?.id}
          </DialogTitle>
          <DialogContent>
            <AgreementForm
              formData={formData}
              setFormData={setFormData}
              suppliers={suppliers}
              isLoading={isLoadingSuppliers}
              isEdit={true}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, agreement: null })}>
              Отмена
            </Button>
            <Button
              onClick={handleUpdateAgreement}
              variant="contained"
              disabled={isUpdating}
            >
              {isUpdating ? <CircularProgress size={20} /> : 'Сохранить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог управления правилами */}
        <Dialog
          open={rulesDialog.open}
          onClose={() => setRulesDialog({ open: false, agreementId: null })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Правила вознаграждений
          </DialogTitle>
          <DialogContent>
            {rulesDialog.agreementId && (
              <RewardRulesManager agreementId={rulesDialog.agreementId} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRulesDialog({ open: false, agreementId: null })}>
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

// Компонент карточки договоренности
const AgreementCard: React.FC<{
  agreement: PartnerSupplierAgreement;
  supplierName: string;
  onEdit: () => void;
  onDelete: () => void;
  onManageRules: () => void;
}> = ({ agreement, supplierName, onEdit, onDelete, onManageRules }) => {
  const { data: rulesData } = useGetRulesQuery({ agreement_id: agreement.id });
  const rules = rulesData?.data || [];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {supplierName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {agreement.duration_text}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={agreement.status_text}
                color={agreement.active && agreement.current ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`${agreement.reward_rules_count} правил`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Настроить правила">
              <IconButton onClick={onManageRules} size="small">
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Редактировать">
              <IconButton onClick={onEdit} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton onClick={onDelete} size="small" color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {agreement.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {agreement.description}
          </Typography>
        )}

        {/* Краткий список правил */}
        {rules.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Правила вознаграждений ({rules.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {rules.slice(0, 3).map((rule) => (
                  <ListItem key={rule.id}>
                    <ListItemText
                      primary={`${rule.rule_type_display}: ${rule.amount_display}`}
                      secondary={rule.conditions_description}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={rule.active ? 'Активно' : 'Неактивно'}
                        color={rule.active ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {rules.length > 3 && (
                  <ListItem>
                    <ListItemText
                      primary={`... и еще ${rules.length - 3} правил`}
                      sx={{ fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

// Компонент формы договоренности
const AgreementForm: React.FC<{
  formData: CreateAgreementData;
  setFormData: React.Dispatch<React.SetStateAction<CreateAgreementData>>;
  suppliers: any[];
  isLoading: boolean;
  isEdit?: boolean;
}> = ({ formData, setFormData, suppliers, isLoading, isEdit = false }) => {
  const handleChange = (field: keyof CreateAgreementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Поставщик"
          value={formData.supplier_id}
          onChange={(e) => handleChange('supplier_id', Number(e.target.value))}
          disabled={isLoading || isEdit}
          required
        >
          <MenuItem value={0} disabled>
            Выберите поставщика
          </MenuItem>
          {suppliers.map((supplier) => (
            <MenuItem key={supplier.id} value={supplier.id}>
              {supplier.name} ({supplier.firm_id})
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Дата начала"
          value={new Date(formData.start_date)}
          onChange={(value) => handleChange('start_date', value?.toISOString().split('T')[0] || '')}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Дата окончания (опционально)"
          value={formData.end_date ? new Date(formData.end_date) : null}
          onChange={(value) => handleChange('end_date', value?.toISOString().split('T')[0] || '')}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Тип комиссии"
          value={formData.commission_type}
          onChange={(e) => handleChange('commission_type', e.target.value)}
          required
        >
          <MenuItem value="custom">Индивидуальные условия</MenuItem>
                          <MenuItem value="percentage">Фиксированный процент</MenuItem>
          <MenuItem value="fixed_amount">Фиксированная сумма</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Статус"
          value={formData.active ? 'true' : 'false'}
          onChange={(e) => handleChange('active', e.target.value === 'true')}
        >
          <MenuItem value="true">Активная</MenuItem>
          <MenuItem value="false">Неактивная</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Описание"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          helperText="Дополнительная информация о договоренности"
        />
      </Grid>
    </Grid>
  );
};

export default PartnerAgreementsList;