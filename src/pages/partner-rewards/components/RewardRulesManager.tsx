import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  ExpandMore,
  Info,
} from '@mui/icons-material';
import {
  useGetRulesQuery,
  useGetRuleTypesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  usePreviewRuleMutation,
  RewardRule,
  CreateRuleData,
  RewardPreview,
} from '../../../api/partnerRewards.api';

interface RewardRulesManagerProps {
  agreementId: number;
}

const RewardRulesManager: React.FC<RewardRulesManagerProps> = ({ agreementId }) => {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    rule: RewardRule | null;
  }>({
    open: false,
    rule: null,
  });
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    ruleId: number | null;
    preview: RewardPreview | null;
  }>({
    open: false,
    ruleId: null,
    preview: null,
  });

  const [formData, setFormData] = useState<CreateRuleData & { conditions_obj: any }>({
    rule_type: 'percentage',
    amount: 0,
    priority: 0,
    active: true,
    description: '',
    conditions: '',
    conditions_obj: {},
  });

  const [previewData, setPreviewData] = useState({
    total_amount: 5000,
    items_count: 4,
    brands: ['Michelin'],
    diameters: ['17'],
  });

  const {
    data: rulesData,
    isLoading: isLoadingRules,
    error: rulesError,
  } = useGetRulesQuery({ agreement_id: agreementId });

  const { data: ruleTypesData } = useGetRuleTypesQuery();

  const [createRule, { isLoading: isCreating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [previewRule, { isLoading: isPreviewing }] = usePreviewRuleMutation();

  const rules = rulesData?.data || [];
  const ruleTypes = ruleTypesData?.rule_types || [];

  const handleCreateRule = async () => {
    try {
      const ruleData = {
        ...formData,
        conditions: JSON.stringify(formData.conditions_obj),
      };
      delete (ruleData as any).conditions_obj;

      await createRule({
        agreement_id: agreementId,
        data: ruleData,
      }).unwrap();

      setCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Ошибка создания правила:', error);
    }
  };

  const handleUpdateRule = async () => {
    if (!editDialog.rule) return;

    try {
      const ruleData = {
        ...formData,
        conditions: JSON.stringify(formData.conditions_obj),
      };
      delete (ruleData as any).conditions_obj;

      await updateRule({
        id: editDialog.rule.id,
        data: ruleData,
      }).unwrap();

      setEditDialog({ open: false, rule: null });
      resetForm();
    } catch (error) {
      console.error('Ошибка обновления правила:', error);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это правило?')) {
      try {
        await deleteRule(id).unwrap();
      } catch (error) {
        console.error('Ошибка удаления правила:', error);
      }
    }
  };

  const handlePreviewRule = async (ruleId: number) => {
    try {
      const result = await previewRule({
        id: ruleId,
        testData: previewData,
      }).unwrap();

      setPreviewDialog({
        open: true,
        ruleId,
        preview: result,
      });
    } catch (error) {
      console.error('Ошибка предварительного расчета:', error);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialog(true);
  };

  const openEditDialog = (rule: RewardRule) => {
    setFormData({
      rule_type: rule.rule_type,
      amount: rule.amount,
      priority: rule.priority,
      active: rule.active,
      description: rule.description || '',
      conditions: rule.conditions || '',
      conditions_obj: rule.conditions_hash || {},
    });
    setEditDialog({ open: true, rule });
  };

  const resetForm = () => {
    setFormData({
      rule_type: 'percentage',
      amount: 0,
      priority: 0,
      active: true,
      description: '',
      conditions: '',
      conditions_obj: {},
    });
  };

  const updateCondition = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions_obj: {
        ...prev.conditions_obj,
        [field]: value,
      },
    }));
  };

  if (rulesError) {
    return (
      <Alert severity="error">
        Ошибка загрузки правил вознаграждений
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок и кнопка создания */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          ⚙️ Правила вознаграждений ({rules.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Новое правило
        </Button>
      </Box>

      {/* Информация о приоритетах */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Как работают правила:</strong> При создании заказа применяется правило с наивысшим приоритетом (меньшее число = выше приоритет). 
          Если правило не применимо, проверяется следующее по приоритету.
        </Typography>
      </Alert>

      {/* Таблица правил */}
      {isLoadingRules ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ⚙️ Нет правил вознаграждений
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первое правило, чтобы начать получать вознаграждения за заказы
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateDialog}
            >
              Создать правило
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Приоритет</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Сумма/Процент</TableCell>
                <TableCell>Условия</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules
                .sort((a, b) => a.priority - b.priority)
                .map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Chip
                        label={rule.priority}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rule.rule_type_display}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {rule.amount_display}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {rule.conditions_description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.active ? 'Активно' : 'Неактивно'}
                        color={rule.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Предварительный расчет">
                          <IconButton
                            size="small"
                            onClick={() => handlePreviewRule(rule.id)}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог создания правила */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Новое правило вознаграждения</DialogTitle>
        <DialogContent>
          <RuleForm
            formData={formData}
            setFormData={setFormData}
            ruleTypes={ruleTypes}
            updateCondition={updateCondition}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateRule}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? <CircularProgress size={20} /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования правила */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, rule: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Редактирование правила #{editDialog.rule?.id}
        </DialogTitle>
        <DialogContent>
          <RuleForm
            formData={formData}
            setFormData={setFormData}
            ruleTypes={ruleTypes}
            updateCondition={updateCondition}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, rule: null })}>
            Отмена
          </Button>
          <Button
            onClick={handleUpdateRule}
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог предварительного расчета */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, ruleId: null, preview: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Предварительный расчет вознаграждения</DialogTitle>
        <DialogContent>
          {previewDialog.preview && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity={previewDialog.preview.applicable ? 'success' : 'warning'}>
                    {previewDialog.preview.applicable 
                      ? `Правило применимо. Вознаграждение: ${previewDialog.preview.calculated_amount} ₴`
                      : 'Правило не применимо к тестовому заказу'
                    }
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Тестовые данные:
                  </Typography>
                  <Typography variant="body2">
                    • Сумма заказа: {previewDialog.preview.test_data.total_amount} ₴<br/>
                    • Количество товаров: {previewDialog.preview.test_data.items_count}<br/>
                    • Бренды: {previewDialog.preview.test_data.brands?.join(', ')}<br/>
                    • Диаметры: {previewDialog.preview.test_data.diameters?.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Описание правила:
                  </Typography>
                  <Typography variant="body2">
                    {previewDialog.preview.rule_description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Условия:
                  </Typography>
                  <Typography variant="body2">
                    {previewDialog.preview.conditions}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, ruleId: null, preview: null })}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Компонент формы правила
const RuleForm: React.FC<{
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  ruleTypes: any[];
  updateCondition: (field: string, value: any) => void;
}> = ({ formData, setFormData, ruleTypes, updateCondition }) => {
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {/* Основные настройки */}
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Тип правила"
          value={formData.rule_type}
          onChange={(e) => handleChange('rule_type', e.target.value)}
          required
        >
          {ruleTypes.map((type) => (
            <MenuItem key={type.key} value={type.key}>
              {type.display}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label={formData.rule_type === 'percentage' ? 'Процент' : 'Сумма (₴)'}
          value={formData.amount}
          onChange={(e) => handleChange('amount', Number(e.target.value))}
          required
          inputProps={{ min: 0, step: formData.rule_type === 'percentage' ? 0.1 : 1 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Приоритет"
          value={formData.priority}
          onChange={(e) => handleChange('priority', Number(e.target.value))}
          required
          helperText="Меньшее число = выше приоритет"
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
            />
          }
          label="Активное правило"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Описание"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          helperText="Краткое описание правила"
        />
      </Grid>

      {/* Условия применения */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">
              Условия применения (опционально)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Минимальная сумма заказа"
                  type="number"
                  value={formData.conditions_obj.min_order_amount || ''}
                  onChange={(e) => updateCondition('min_order_amount', Number(e.target.value) || undefined)}
                  helperText="Заказы меньше этой суммы не учитываются"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Бренды товаров"
                  value={formData.conditions_obj.brands?.join(', ') || ''}
                  onChange={(e) => updateCondition('brands', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  helperText="Через запятую (например: Michelin, Continental)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Диаметры шин"
                  value={formData.conditions_obj.diameters?.join(', ') || ''}
                  onChange={(e) => updateCondition('diameters', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  helperText="Через запятую (например: 15, 16, 17)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.conditions_obj.exclude_brands || false}
                      onChange={(e) => updateCondition('exclude_brands', e.target.checked)}
                    />
                  }
                  label="Исключить указанные бренды"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default RewardRulesManager;