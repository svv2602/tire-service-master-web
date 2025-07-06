import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors,
  getTablePageStyles
} from '../../styles';
import { 
  useGetPageContentByIdQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  PageContent,
  CreatePageContentRequest
} from '../../api/pageContent.api';

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
      id={`page-content-tabpanel-${index}`}
      aria-labelledby={`page-content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PageContentFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const tablePageStyles = getTablePageStyles(theme);
  
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState(0);
  
  // Состояние формы
  const [formData, setFormData] = useState<Partial<CreatePageContentRequest>>({
    section: 'client',
    content_type: 'hero',
    title: '',
    content: '',
    image_url: '',
    position: 0,
    active: true
  });
  
  // Состояние для загрузки изображения
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // API запросы
  const {
    data: pageData,
    isLoading,
    error
  } = useGetPageContentByIdQuery(parseInt(id!) || 0, { skip: !isEdit });
  
  const [createPage, { isLoading: isCreating }] = useCreatePageContentMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageContentMutation();
  
  // Загрузка данных при редактировании
  useEffect(() => {
    if (pageData) {
      setFormData({
        section: pageData.section,
        content_type: pageData.content_type,
        title: pageData.title,
        content: pageData.content,
        image_url: pageData.image_url || '',
        position: pageData.position,
        active: pageData.active
      });
      
      // Устанавливаем превью для существующего изображения
      if (pageData.image_url) {
        setImagePreview(pageData.image_url);
      }
    }
  }, [pageData]);
  
  // Обработка изменения полей
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Обработчик загрузки изображения
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert(t('forms.pageContent.messages.selectImage'));
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('forms.pageContent.messages.fileSizeError'));
      return;
    }

    setImageFile(file);
    
    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Очищаем URL если был
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  // Обработчик удаления изображения
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    
    // Очищаем input
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };
  
  // Сохранение
  const handleSave = async () => {
    try {
      setSuccessMessage('');
      
      const saveData = {
        ...formData,
        ...(imageFile && { image: imageFile })
      };
      
      if (isEdit) {
        await updatePage({
          id: parseInt(id!),
          ...saveData
        }).unwrap();
        setSuccessMessage(t('forms.pageContent.messages.updateSuccess'));
      } else {
        await createPage(saveData as CreatePageContentRequest).unwrap();
        setSuccessMessage(t('forms.pageContent.messages.createSuccess'));
      }
      
      setTimeout(() => navigate('/admin/page-content'), 1000);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {t('forms.pageContent.messages.loadError')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600 }}>
          {isEdit ? t('forms.pageContent.title.edit') : t('forms.pageContent.title.create')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/page-content')}
          >
            {t('forms.pageContent.buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isCreating || isUpdating}
          >
            {isEdit ? t('forms.pageContent.buttons.update') : t('forms.pageContent.buttons.create')}
          </Button>
        </Box>
      </Box>

      {/* Сообщение об успехе */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Форма */}
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Секция</InputLabel>
              <Select
                value={formData.section || ''}
                label={t("forms.pageContent.fields.section")}
                onChange={(e) => handleFieldChange('section', e.target.value)}
              >
                <MenuItem value="client">{t('forms.pageContent.sections.client')}</MenuItem>
                <MenuItem value="admin">{t('forms.pageContent.sections.admin')}</MenuItem>
                <MenuItem value="service">{t('forms.pageContent.sections.service')}</MenuItem>
                <MenuItem value="about">{t('forms.pageContent.sections.about')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Тип контента</InputLabel>
              <Select
                value={formData.content_type || ''}
                label={t("forms.pageContent.fields.contentType")}
                onChange={(e) => handleFieldChange('content_type', e.target.value)}
              >
                <MenuItem value="hero">{t('forms.pageContent.contentTypes.hero')}</MenuItem>
                <MenuItem value="service">{t('forms.pageContent.contentTypes.service')}</MenuItem>
                <MenuItem value="city">{t('forms.pageContent.contentTypes.city')}</MenuItem>
                <MenuItem value="article">{t('forms.pageContent.contentTypes.article')}</MenuItem>
                <MenuItem value="cta">{t('forms.pageContent.contentTypes.cta')}</MenuItem>
                <MenuItem value="footer">{t('forms.pageContent.contentTypes.footer')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("forms.pageContent.fields.title")}
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("forms.pageContent.fields.content")}
              value={formData.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              multiline
              rows={6}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('forms.pageContent.fields.image')}
            </Typography>
            
            {/* Кнопка загрузки */}
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 2 }}
                >
                  {t('forms.pageContent.buttons.uploadImage')}
                </Button>
              </label>
              
              {imagePreview && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleImageRemove}
                  startIcon={<DeleteIcon />}
                >
                  {t('forms.pageContent.buttons.deleteImage')}
                </Button>
              )}
            </Box>

            {/* Превью изображения */}
            {imagePreview && (
              <Card sx={{ maxWidth: 400, mb: 2 }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt={t('forms.pageContent.messages.imagePreview')}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                />
              </Card>
            )}

            {/* Поле URL как альтернатива */}
            <TextField
              fullWidth
              label={t("forms.pageContent.fields.orImageUrl")}
              value={formData.image_url || ''}
              onChange={(e) => handleFieldChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={!!imageFile}
              helperText={imageFile ? t('forms.pageContent.messages.clearUploadedImage') : t('forms.pageContent.messages.urlAlternative')}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t("forms.pageContent.fields.position")}
              type="number"
              value={formData.position || 0}
              onChange={(e) => handleFieldChange('position', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active || false}
                  onChange={(e) => handleFieldChange('active', e.target.checked)}
                />
              }
              label={t("forms.pageContent.fields.active")}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PageContentFormPage; 