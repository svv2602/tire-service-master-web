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
  useUpdatePageContentMutation
} from '../../api/pageContent.api';
import { PageContent, PageContentBlock } from '../../types';

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
  const [formData, setFormData] = useState({
    pageName: '',
    pageTitle: '',
    pageDescription: '',
    isActive: true,
    blocks: [] as Omit<PageContentBlock, 'id' | 'createdAt' | 'updatedAt'>[]
  });
  
  // API запросы
  const {
    data: pageData,
    isLoading,
    error
  } = useGetPageContentByIdQuery(id!, { skip: !isEdit });
  
  const [createPage, { isLoading: isCreating }] = useCreatePageContentMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageContentMutation();
  
  // Загрузка данных при редактировании
  useEffect(() => {
    if (pageData) {
      setFormData({
        pageName: pageData.pageName,
        pageTitle: pageData.pageTitle,
        pageDescription: pageData.pageDescription,
        isActive: pageData.isActive,
        blocks: pageData.blocks.map(block => ({
          type: block.type,
          title: block.title,
          subtitle: block.subtitle,
          content: block.content,
          isActive: block.isActive,
          order: block.order,
          settings: block.settings
        }))
      });
    }
  }, [pageData]);
  
  // Типы блоков контента
  const blockTypes = [
    { value: 'hero', label: 'Hero секция', icon: '🎯', description: 'Главный баннер страницы' },
    { value: 'services', label: 'Услуги', icon: '🔧', description: 'Список популярных услуг' },
    { value: 'cta', label: 'CTA блок', icon: '📢', description: 'Призыв к действию' },
    { value: 'text', label: 'Текстовый блок', icon: '📝', description: 'Произвольный текст' },
    { value: 'features', label: 'Преимущества', icon: '⭐', description: 'Список преимуществ' },
    { value: 'testimonials', label: 'Отзывы', icon: '💬', description: 'Отзывы клиентов' }
  ];
  
  // Обработка изменения основных полей
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Добавление нового блока
  const handleAddBlock = (blockType: string) => {
    const newBlock: Omit<PageContentBlock, 'id' | 'createdAt' | 'updatedAt'> = {
      type: blockType as any,
      title: `Новый ${blockTypes.find(t => t.value === blockType)?.label}`,
      subtitle: '',
      content: {},
      isActive: true,
      order: formData.blocks.length,
      settings: {
        backgroundColor: '',
        textColor: '',
        showIcon: true,
        itemsPerRow: 3,
        maxItems: 6
      }
    };
    
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };
  
  // Удаление блока
  const handleDeleteBlock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };
  
  // Обновление блока
  const handleUpdateBlock = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };
  
  // Сохранение
  const handleSave = async () => {
    try {
      if (isEdit) {
        await updatePage({
          id: id!,
          content: {
            pageTitle: formData.pageTitle,
            pageDescription: formData.pageDescription,
            blocks: formData.blocks,
            isActive: formData.isActive
          }
        }).unwrap();
      } else {
        await createPage({
          pageName: formData.pageName,
          pageTitle: formData.pageTitle,
          pageDescription: formData.pageDescription,
          blocks: formData.blocks
        }).unwrap();
      }
      
      navigate('/page-content');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: SIZES.borderRadius.md }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: SIZES.borderRadius.md }} />
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
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
          {isEdit ? '✏️ Редактирование страницы' : '➕ Создание страницы'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            sx={secondaryButtonStyles}
            onClick={() => window.open('/client', '_blank')}
          >
            Предпросмотр
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/page-content')}
            sx={secondaryButtonStyles}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            sx={buttonStyles}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </Box>

      {/* Табы */}
      <Paper sx={{ ...cardStyles, mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="📄 Основные настройки" />
          <Tab label="🧩 Блоки контента" />
          <Tab label="⚙️ Дополнительно" />
        </Tabs>
        
        {/* Основные настройки */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Системное имя страницы"
                value={formData.pageName}
                onChange={(e) => handleFieldChange('pageName', e.target.value)}
                disabled={isEdit}
                placeholder="main, services, about..."
                helperText="Используется в URL и коде (нельзя изменить после создания)"
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  />
                }
                label="Активна"
                sx={{ color: colors.textPrimary }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Заголовок страницы"
                value={formData.pageTitle}
                onChange={(e) => handleFieldChange('pageTitle', e.target.value)}
                placeholder="Отображаемое название страницы"
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание страницы"
                value={formData.pageDescription}
                onChange={(e) => handleFieldChange('pageDescription', e.target.value)}
                placeholder="Краткое описание содержимого страницы"
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Блоки контента */}
        <TabPanel value={activeTab} index={1}>
          {/* Кнопки добавления блоков */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: colors.backgroundSecondary }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              ➕ Добавить блок контента
            </Typography>
            <Grid container spacing={2}>
              {blockTypes.map((blockType) => (
                <Grid item xs={12} sm={6} md={4} key={blockType.value}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<span>{blockType.icon}</span>}
                    onClick={() => handleAddBlock(blockType.value)}
                    sx={{
                      ...secondaryButtonStyles,
                      height: 60,
                      flexDirection: 'column',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {blockType.label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {blockType.description}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Список блоков */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formData.blocks.length === 0 ? (
              <Paper sx={{ ...cardStyles, p: 6, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                  🧩 Нет блоков контента
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Добавьте первый блок для начала создания страницы
                </Typography>
              </Paper>
            ) : (
              formData.blocks.map((block, index) => {
                const blockType = blockTypes.find(t => t.value === block.type);
                
                return (
                  <Accordion key={index} sx={cardStyles}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ bgcolor: colors.backgroundSecondary }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <DragIcon sx={{ color: colors.textSecondary }} />
                        <Typography variant="h5">{blockType?.icon}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                            {block.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {blockType?.label} • Порядок: {block.order + 1}
                          </Typography>
                        </Box>
                        <Chip 
                          label={block.isActive ? 'Активен' : 'Скрыт'} 
                          size="small"
                          color={block.isActive ? 'primary' : 'default'}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(index);
                          }}
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Заголовок блока"
                            value={block.title}
                            onChange={(e) => handleUpdateBlock(index, 'title', e.target.value)}
                            sx={textFieldStyles}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Подзаголовок"
                            value={block.subtitle || ''}
                            onChange={(e) => handleUpdateBlock(index, 'subtitle', e.target.value)}
                            sx={textFieldStyles}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={block.isActive}
                                onChange={(e) => handleUpdateBlock(index, 'isActive', e.target.checked)}
                              />
                            }
                            label="Блок активен"
                            sx={{ color: colors.textPrimary }}
                          />
                        </Grid>
                        {/* Дополнительные поля в зависимости от типа блока */}
                        {block.type === 'services' && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Элементов в ряду"
                                value={block.settings.itemsPerRow || 3}
                                onChange={(e) => handleUpdateBlock(index, 'settings', {
                                  ...block.settings,
                                  itemsPerRow: parseInt(e.target.value)
                                })}
                                sx={textFieldStyles}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Максимум элементов"
                                value={block.settings.maxItems || 6}
                                onChange={(e) => handleUpdateBlock(index, 'settings', {
                                  ...block.settings,
                                  maxItems: parseInt(e.target.value)
                                })}
                                sx={textFieldStyles}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </Box>
        </TabPanel>

        {/* Дополнительные настройки */}
        <TabPanel value={activeTab} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            🚧 Дополнительные настройки будут добавлены в следующих обновлениях
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2 }}>
                🎨 Настройки темы
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                В будущем здесь будут настройки цветовой схемы, шрифтов и других элементов дизайна
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PageContentFormPage; 