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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors 
} from '../../styles';
import { 
  useGetPageContentByIdQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  PageContent,
  CreatePageContentRequest
} from '../../api/pageContent.api';
import { PageContentBlock } from '../../types';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  const isEdit = id !== 'new';
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
    }
  }, [pageData]);
  
  // Обработка изменения полей
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Сохранение
  const handleSave = async () => {
    try {
      if (isEdit) {
        await updatePage({
          id: parseInt(id!),
          ...formData
        }).unwrap();
      } else {
        await createPage(formData as CreatePageContentRequest).unwrap();
      }
      
      navigate('/page-content');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Ошибка при загрузке данных страницы
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600 }}>
          {isEdit ? 'Редактирование контента' : 'Создание контента'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/page-content')}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isCreating || isUpdating}
          >
            {isEdit ? 'Обновить' : 'Создать'}
          </Button>
        </Box>
      </Box>

      {/* Форма */}
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Секция</InputLabel>
              <Select
                value={formData.section || ''}
                label="Секция"
                onChange={(e) => handleFieldChange('section', e.target.value)}
              >
                <MenuItem value="client">Главная страница клиента</MenuItem>
                <MenuItem value="admin">Панель администратора</MenuItem>
                <MenuItem value="service">Страница услуг</MenuItem>
                <MenuItem value="about">О нас</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Тип контента</InputLabel>
              <Select
                value={formData.content_type || ''}
                label="Тип контента"
                onChange={(e) => handleFieldChange('content_type', e.target.value)}
              >
                <MenuItem value="hero">Главный баннер</MenuItem>
                <MenuItem value="service">Услуга</MenuItem>
                <MenuItem value="city">Город</MenuItem>
                <MenuItem value="article">Статья</MenuItem>
                <MenuItem value="cta">Призыв к действию</MenuItem>
                <MenuItem value="footer">Подвал</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Заголовок"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Контент"
              value={formData.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              multiline
              rows={6}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="URL изображения"
              value={formData.image_url || ''}
              onChange={(e) => handleFieldChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Позиция"
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
              label="Активный"
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PageContentFormPage; 