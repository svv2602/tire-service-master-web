import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';
import { useTheme } from '@mui/material/styles';
import { useGetCustomVariablesQuery, useCreateCustomVariableMutation, useUpdateCustomVariableMutation, useDeleteCustomVariableMutation } from '../../api/customVariables.api';

interface CustomVariableFormData {
  name: string;
  description: string;
  example_value: string;
  category: string;
}

const VARIABLE_CATEGORIES = [
  { value: 'client', label: 'Клиент', color: 'primary' },
  { value: 'booking', label: 'Бронирование', color: 'secondary' },
  { value: 'service_point', label: 'Сервисная точка', color: 'success' },
  { value: 'service', label: 'Услуги', color: 'warning' },
  { value: 'car', label: 'Автомобиль', color: 'info' },
  { value: 'system', label: 'Система', color: 'default' },
  { value: 'custom', label: 'Пользовательские', color: 'error' },
];

const CustomVariablesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // API hooks
  const { data: variablesData, isLoading, error, refetch } = useGetCustomVariablesQuery({});
  const [createVariable] = useCreateCustomVariableMutation();
  const [updateVariable] = useUpdateCustomVariableMutation();
  const [deleteVariable] = useDeleteCustomVariableMutation();

  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<any>(null);
  const [formData, setFormData] = useState<CustomVariableFormData>({
    name: '',
    description: '',
    example_value: '',
    category: 'custom'
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const variables = variablesData?.data || [];

  const handleOpenDialog = (variable?: any) => {
    if (variable) {
      setEditingVariable(variable);
      setFormData({
        name: variable.name,
        description: variable.description,
        example_value: variable.example_value,
        category: variable.category || 'custom'
      });
    } else {
      setEditingVariable(null);
      setFormData({
        name: '',
        description: '',
        example_value: '',
        category: 'custom'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVariable(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setNotification({
        open: true,
        message: 'Название переменной обязательно',
        severity: 'warning'
      });
      return;
    }

    // Проверка на валидность названия
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
      setNotification({
        open: true,
        message: 'Название должно содержать только английские буквы, цифры и подчеркивания',
        severity: 'warning'
      });
      return;
    }

    try {
      if (editingVariable) {
        await updateVariable({
          id: parseInt(editingVariable.id),
          data: {
            ...formData,
            is_active: true
          }
        }).unwrap();
        setNotification({
          open: true,
          message: 'Переменная обновлена',
          severity: 'success'
        });
      } else {
        await createVariable({
          ...formData,
          is_active: true
        }).unwrap();
        setNotification({
          open: true,
          message: 'Переменная создана',
          severity: 'success'
        });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при сохранении переменной',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (variableId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту переменную?')) {
      try {
        await deleteVariable(parseInt(variableId)).unwrap();
        setNotification({
          open: true,
          message: 'Переменная удалена',
          severity: 'success'
        });
        refetch();
      } catch (error) {
        setNotification({
          open: true,
          message: 'Ошибка при удалении переменной',
          severity: 'error'
        });
      }
    }
  };

  const getCategoryInfo = (category: string) => {
    return VARIABLE_CATEGORIES.find(cat => cat.value === category) || VARIABLE_CATEGORIES[6];
  };

  if (isLoading) return <Typography>Загрузка...</Typography>;
  if (error) return <Typography color="error">Ошибка загрузки данных</Typography>;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Typography variant="h4" gutterBottom>
        Управление переменными
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Создавайте и управляйте кастомными переменными для email шаблонов
      </Typography>

      {notification.open && (
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Список переменных ({variables.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить переменную
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Пример значения</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variables.map((variable: any) => {
                  const categoryInfo = getCategoryInfo(variable.category);
                  return (
                    <TableRow key={variable.id} hover>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          component="code" 
                          sx={{ 
                            fontFamily: 'monospace',
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {`{${variable.name}}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={categoryInfo.label} 
                          color={categoryInfo.color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {variable.description || 'Без описания'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.success.main }}>
                          "{variable.example_value || 'Не указано'}"
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Редактировать">
                            <IconButton 
                              size="small"
                              onClick={() => handleOpenDialog(variable)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(variable.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {variables.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                У вас пока нет переменных. Создайте первую переменную, нажав кнопку "Добавить переменную".
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVariable ? 'Редактировать переменную' : 'Создать переменную'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Название переменной *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="client_name"
              helperText="Только английские буквы, цифры и подчеркивания"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Категория"
              >
                {VARIABLE_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Имя клиента"
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="Пример значения"
              value={formData.example_value}
              onChange={(e) => setFormData({ ...formData, example_value: e.target.value })}
              placeholder="Иван Иванов"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.name.trim()}
          >
            {editingVariable ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomVariablesPage; 