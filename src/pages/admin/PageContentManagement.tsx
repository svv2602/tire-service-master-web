import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  Tooltip,
} from '@mui/material';

// UI компоненты  
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useGetPageContentsQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  useDeletePageContentMutation,
  PageContent,
  CreatePageContentRequest
} from '../../api/pageContent.api';

// Типи контенту з українськими назвами
const CONTENT_TYPES = {
  hero: 'Головний банер',
  service: 'Послуга',
  city: 'Місто',
  article: 'Стаття',
  cta: 'Заклик до дії',
  footer: 'Підвал'
};

// Секції сторінки
const PAGE_SECTIONS = {
  client: 'Головна сторінка клієнта',
  admin: 'Панель адміністратора',
  service: 'Сторінка послуг',
  about: 'Про нас'
};

const PageContentManagement: React.FC = () => {
  // Стан компонента
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filterSection, setFilterSection] = useState('');
  const [filterType, setFilterType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Форма для створення/редагування контенту
  const [formData, setFormData] = useState<Partial<CreatePageContentRequest>>({
    section: 'client',
    content_type: 'hero',
    title: '',
    content: '',
    image_url: '',
    settings: {},
    position: 0,
    active: true
  });

  // API хуки
  const { data: contents, isLoading, error, refetch } = useGetPageContentsQuery({
    section: filterSection || undefined,
    content_type: filterType || undefined
  });

  const [createContent] = useCreatePageContentMutation();
  const [updateContent] = useUpdatePageContentMutation();
  const [deleteContent] = useDeletePageContentMutation();

  // Обробники подій
  const handleOpenDialog = (content?: PageContent) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        section: content.section,
        content_type: content.content_type,
        title: content.title,
        content: content.content,
        image_url: content.image_url || '',
        settings: content.settings || {},
        position: content.position,
        active: content.active
      });
    } else {
      setEditingContent(null);
      setFormData({
        section: 'client',
        content_type: 'hero',
        title: '',
        content: '',
        image_url: '',
        settings: {},
        position: 0,
        active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContent(null);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingContent) {
        await updateContent({
          id: editingContent.id,
          ...formData
        }).unwrap();
        setSnackbar({ open: true, message: 'Контент успішно оновлено!', severity: 'success' });
      } else {
        await createContent(formData as CreatePageContentRequest).unwrap();
        setSnackbar({ open: true, message: 'Контент успішно створено!', severity: 'success' });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: 'Помилка при збереженні контенту', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей контент?')) {
      try {
        await deleteContent(id).unwrap();
        setSnackbar({ open: true, message: 'Контент успішно видалено!', severity: 'success' });
        refetch();
      } catch (error) {
        setSnackbar({ open: true, message: 'Помилка при видаленні контенту', severity: 'error' });
      }
    }
  };

  const handleToggleActive = async (content: PageContent) => {
    try {
      await updateContent({
        id: content.id,
        active: !content.active
      }).unwrap();
      setSnackbar({ 
        open: true, 
        message: `Контент ${!content.active ? 'активовано' : 'деактивовано'}!`, 
        severity: 'success' 
      });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: 'Помилка при зміні статусу', severity: 'error' });
    }
  };

  // Конфигурация колонок для UI Table
  const columns: Column[] = [
    { id: 'id', label: 'ID', minWidth: 50, align: 'left' },
    { 
      id: 'section', 
      label: 'Секція', 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={PAGE_SECTIONS[value as keyof typeof PAGE_SECTIONS] || value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { 
      id: 'content_type', 
      label: 'Тип', 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={CONTENT_TYPES[value as keyof typeof CONTENT_TYPES] || value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    { 
      id: 'title', 
      label: 'Заголовок', 
      minWidth: 200, 
      wrap: true,
      format: (value: string) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
          {value}
        </Typography>
      )
    },
    { id: 'position', label: 'Позиція', minWidth: 80, align: 'center' },
    { 
      id: 'active', 
      label: 'Статус', 
      minWidth: 100,
      format: (value: boolean) => (
        <Chip 
          label={value ? 'Активний' : 'Неактивний'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      )
    },
    { 
      id: 'actions', 
      label: 'Дії', 
      minWidth: 150,
      align: 'center',
      format: (value: any, row: PageContent) => (
        <Box display="flex" gap={1} justifyContent="center">
          <Tooltip title="Редагувати">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.active ? 'Деактивувати' : 'Активувати'}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(row)}
              color={row.active ? 'warning' : 'success'}
            >
              {row.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Видалити">
            <IconButton
              size="small"
              onClick={() => handleDelete(row.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Фільтрований контент
  const filteredContents = contents?.data || [];

  // Пагінація
  const paginatedContents = filteredContents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Помилка завантаження контенту. Спробуйте оновити сторінку.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управління контентом сторінок
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#2196F3' }}
        >
          Додати контент
        </Button>
      </Box>

      {/* Фільтри */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Секція</InputLabel>
              <Select
                value={filterSection}
                label="Секція"
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <MenuItem value="">Всі секції</MenuItem>
                {Object.entries(PAGE_SECTIONS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Тип контенту</InputLabel>
              <Select
                value={filterType}
                label="Тип контенту"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">Всі типи</MenuItem>
                {Object.entries(CONTENT_TYPES).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterSection('');
                setFilterType('');
                setPage(0);
              }}
            >
              Скинути фільтри
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблиця контенту з UI Table */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={paginatedContents}
        />
        
        {/* Пагинация с UI Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2 
        }}>
          <Pagination
            count={Math.ceil(filteredContents.length / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
            disabled={filteredContents.length <= rowsPerPage}
          />
        </Box>
      </Box>

      {/* Діалог створення/редагування */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContent ? 'Редагувати контент' : 'Створити новий контент'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Секція</InputLabel>
                <Select
                  value={formData.section}
                  label="Секція"
                  onChange={(e) => handleFormChange('section', e.target.value)}
                >
                  {Object.entries(PAGE_SECTIONS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип контенту</InputLabel>
                <Select
                  value={formData.content_type}
                  label="Тип контенту"
                  onChange={(e) => handleFormChange('content_type', e.target.value)}
                >
                  {Object.entries(CONTENT_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Заголовок"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Контент"
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="URL зображення"
                value={formData.image_url}
                onChange={(e) => handleFormChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Позиція"
                type="number"
                value={formData.position}
                onChange={(e) => handleFormChange('position', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                  />
                }
                label="Активний"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#4CAF50' }}
          >
            {editingContent ? 'Оновити' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для повідомлень */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PageContentManagement;