import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  DragIndicator as DragIcon
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PageContentManagement: React.FC = () => {
  // Стан компонента
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

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

  // Фільтрований контент
  const filteredContents = contents?.data || [];

  // Пагінація
  const paginatedContents = filteredContents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

      {/* Таблиця контенту */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Секція</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Заголовок</TableCell>
              <TableCell>Позиція</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedContents.map((content) => (
              <TableRow key={content.id}>
                <TableCell>{content.id}</TableCell>
                <TableCell>
                  <Chip 
                    label={PAGE_SECTIONS[content.section as keyof typeof PAGE_SECTIONS] || content.section}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={CONTENT_TYPES[content.content_type as keyof typeof CONTENT_TYPES] || content.content_type}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {content.title}
                  </Typography>
                </TableCell>
                <TableCell>{content.position}</TableCell>
                <TableCell>
                  <Chip 
                    label={content.active ? 'Активний' : 'Неактивний'}
                    size="small"
                    color={content.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Редагувати">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(content)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={content.active ? 'Деактивувати' : 'Активувати'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(content)}
                        color={content.active ? 'warning' : 'success'}
                      >
                        {content.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Видалити">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(content.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Рядків на сторінці:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} з ${count}`}
        />
      </TableContainer>

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