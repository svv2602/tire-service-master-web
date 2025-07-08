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
import { useTranslation } from 'react-i18next';

// UI components  
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

// Content types - will be translated dynamically
const CONTENT_TYPES = {
  hero: 'hero',
  service: 'service',
  city: 'city',
  article: 'article',
  cta: 'cta',
  footer: 'footer'
};

// Page sections - will be translated dynamically
const PAGE_SECTIONS = {
  client: 'client',
  admin: 'admin',
  service: 'service',
  about: 'about'
};

const PageContentManagement: React.FC = () => {
  const { t } = useTranslation();
  
  // Component state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filterSection, setFilterSection] = useState('');
  const [filterType, setFilterType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form for creating/editing content
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

  // API hooks
  const { data: contents, isLoading, error, refetch } = useGetPageContentsQuery({
    section: filterSection || undefined,
    content_type: filterType || undefined
  });

  const [createContent] = useCreatePageContentMutation();
  const [updateContent] = useUpdatePageContentMutation();
  const [deleteContent] = useDeletePageContentMutation();

  // Event handlers
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
        setSnackbar({ open: true, message: t('admin.pageContent.messages.updateSuccess'), severity: 'success' });
      } else {
        await createContent(formData as CreatePageContentRequest).unwrap();
        setSnackbar({ open: true, message: t('admin.pageContent.messages.createSuccess'), severity: 'success' });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: t('admin.pageContent.messages.saveError'), severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.pageContent.confirmDelete'))) {
      try {
        await deleteContent(id).unwrap();
        setSnackbar({ open: true, message: t('admin.pageContent.messages.deleteSuccess'), severity: 'success' });
        refetch();
      } catch (error) {
        setSnackbar({ open: true, message: t('admin.pageContent.messages.deleteError'), severity: 'error' });
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
        message: t('admin.pageContent.messages.statusChanged', { 
          status: !content.active ? t('admin.pageContent.activated') : t('admin.pageContent.deactivated')
        }), 
        severity: 'success' 
      });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: t('admin.pageContent.messages.statusError'), severity: 'error' });
    }
  };

  // Column configuration for UI Table
  const columns: Column[] = [
    { id: 'id', label: 'ID', minWidth: 50, align: 'left' },
    { 
      id: 'section', 
      label: t('admin.pageContent.columns.section'), 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={t(`admin.pageContent.sections.${value}`) || value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { 
      id: 'content_type', 
      label: t('admin.pageContent.columns.type'), 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={t(`admin.pageContent.contentTypes.${value}`) || value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    { 
      id: 'title', 
      label: t('admin.pageContent.columns.title'), 
      minWidth: 200, 
      wrap: true,
      format: (value: string) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
          {value}
        </Typography>
      )
    },
    { id: 'position', label: t('admin.pageContent.columns.position'), minWidth: 80, align: 'center' },
    { 
      id: 'active', 
      label: t('admin.pageContent.columns.status'), 
      minWidth: 100,
      format: (value: boolean) => (
        <Chip 
          label={value ? t('admin.pageContent.active') : t('admin.pageContent.inactive')}
          size="small"
          color={value ? 'success' : 'default'}
        />
      )
    },
    { 
      id: 'actions', 
      label: t('admin.pageContent.columns.actions'), 
      minWidth: 150,
      align: 'center',
      format: (value: any, row: PageContent) => (
        <Box display="flex" gap={1} justifyContent="center">
          <Tooltip title={t('admin.pageContent.actions.edit')}>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.active ? t('admin.pageContent.actions.deactivate') : t('admin.pageContent.actions.activate')}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(row)}
              color={row.active ? 'warning' : 'success'}
            >
              {row.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('admin.pageContent.actions.delete')}>
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

  // Filtered content
  const filteredContents = contents?.data || [];

  // Pagination
  const paginatedContents = filteredContents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('admin.pageContent.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {t('admin.pageContent.loadError')}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('admin.pageContent.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#2196F3' }}
        >
          {t('admin.pageContent.addContent')}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.pageContent.filters.section')}</InputLabel>
              <Select
                value={filterSection}
                label={t('admin.pageContent.filters.section')}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <MenuItem value="">{t('admin.pageContent.filters.allSections')}</MenuItem>
                {Object.entries(PAGE_SECTIONS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{t(`admin.pageContent.sections.${key}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.pageContent.filters.contentType')}</InputLabel>
              <Select
                value={filterType}
                label={t('admin.pageContent.filters.contentType')}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">{t('admin.pageContent.filters.allTypes')}</MenuItem>
                {Object.entries(CONTENT_TYPES).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{t(`admin.pageContent.contentTypes.${key}`)}</MenuItem>
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
              {t('admin.pageContent.filters.reset')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content table with UI Table */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={paginatedContents}
        />
        
        {/* Pagination with UI Pagination */}
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

      {/* Create/Edit dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContent ? t('admin.pageContent.dialog.editTitle') : t('admin.pageContent.dialog.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.pageContent.dialog.section')}</InputLabel>
                <Select
                  value={formData.section}
                  label={t('admin.pageContent.dialog.section')}
                  onChange={(e) => handleFormChange('section', e.target.value)}
                >
                  {Object.entries(PAGE_SECTIONS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{t(`admin.pageContent.sections.${key}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.pageContent.dialog.contentType')}</InputLabel>
                <Select
                  value={formData.content_type}
                  label={t('admin.pageContent.dialog.contentType')}
                  onChange={(e) => handleFormChange('content_type', e.target.value)}
                >
                  {Object.entries(CONTENT_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{t(`admin.pageContent.contentTypes.${key}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.pageContent.dialog.title')}
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.pageContent.dialog.content')}
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
                label={t('admin.pageContent.dialog.imageUrl')}
                value={formData.image_url}
                onChange={(e) => handleFormChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('admin.pageContent.dialog.position')}
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
                label={t('admin.pageContent.dialog.active')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {t('admin.pageContent.dialog.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#4CAF50' }}
          >
            {editingContent ? t('admin.pageContent.dialog.update') : t('admin.pageContent.dialog.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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