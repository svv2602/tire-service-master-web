import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Fade,
  Divider,
  IconButton,
  useTheme,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Label as LabelIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { useArticleCategories, useArticleActions } from '../../hooks/useArticles';
import type { Article, ArticleSummary, ArticleFormData, CreateArticleRequest } from '../../types/articles';
import { ARTICLE_STATUS_LABELS, ARTICLE_STATUSES } from '../../types/articles';
import RichTextEditor from '../common/RichTextEditor';

// Импорт централизованной системы стилей
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  getFormStyles,
  getChipStyles,
  SIZES,
  getThemeColors
} from '../../styles';

// Импорты UI компонентов
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Tabs } from '../ui/Tabs';
import { Chip } from '../ui/Chip';

interface ArticleFormProps {
  article?: Article | ArticleSummary;
  mode: 'create' | 'edit';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ArticleForm: React.FC<ArticleFormProps> = ({ article, mode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const { categories } = useArticleCategories();
  const { createArticle, updateArticle, loading } = useArticleActions();

  // Получаем централизованные стили
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const formStyles = getFormStyles(theme);

  // Состояние для отображения ошибок
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояние табов
  const [activeTab, setActiveTab] = useState(0);

  // Инициализация формы
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: ARTICLE_STATUSES.DRAFT,
    featured: false,
    meta_title: '',
    meta_description: '',
    featured_image_url: '',
    allow_comments: true,
    tags: [],
  });

  // Состояние UI
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Загрузка данных статьи для редактирования
  useEffect(() => {
    if (mode === 'edit' && article) {
      setFormData({
        title: article.title,
        content: (article as Article).content || '',
        excerpt: article.excerpt || '',
        category: article.category,
        status: article.status === 'archived' ? 'draft' : article.status,
        featured: article.featured,
        meta_title: (article as Article).meta_title || '',
        meta_description: (article as Article).meta_description || '',
        featured_image_url: article.featured_image || '',
        allow_comments: (article as Article).allow_comments ?? true,
        tags: (article as Article).tags || [],
      });
    }
  }, [mode, article]);

  // Автоматическое заполнение SEO полей
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: prev.title.slice(0, 60),
      }));
    }
    if (formData.excerpt && !formData.meta_description) {
      setFormData(prev => ({
        ...prev,
        meta_description: prev.excerpt.slice(0, 160),
      }));
    }
  }, [formData.title, formData.excerpt]);

  // Обработчики изменения формы
  const handleInputChange = (field: keyof ArticleFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    let value: any; // Явно указываем тип any для переменной value
    if (e.target) {
      value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    } else {
      value = e; // для Select компонентов
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Обработчик добавления тегов
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
      setTagInput('');
    }
  };

  // Удаление тега
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (publishStatus: string = formData.status) => {
    setError(null);
    setSuccess(null);
    
    const articleData: CreateArticleRequest = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      status: publishStatus as any,
      featured: formData.featured,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      featured_image_url: formData.featured_image_url || undefined,
      allow_comments: formData.allow_comments,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    let result;
    
    if (mode === 'create') {
      result = await createArticle(articleData);
    } else if (mode === 'edit' && article) {
      result = await updateArticle(article.id, articleData);
    }

    if (result?.success) {
      setSuccess(publishStatus === 'published' ? 'Статья опубликована!' : 'Статья сохранена!');
      setTimeout(() => navigate('/articles'), 1500);
    } else if (result?.error) {
      setError(result.error);
    }
  };

  // Рендер предпросмотра
  const renderPreview = () => (
    <Box sx={{ ...cardStyles, mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2, color: colors.textPrimary }}>
        {formData.title || 'Заголовок статьи'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: colors.textSecondary }}>
        {formData.excerpt || 'Краткое описание статьи'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Box
        sx={{
          '& p': { mb: 2 },
          '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 2, mt: 3, fontWeight: 600 },
          '& ul, & ol': { mb: 2, pl: 3 },
          '& li': { mb: 1 },
          '& blockquote': { 
            borderLeft: `4px solid ${colors.primary}`, 
            pl: 2, 
            py: 1, 
            bgcolor: 'grey.100', 
            fontStyle: 'italic',
            mb: 2
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            mb: 2
          },
          '& pre': {
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            mb: 2
          },
          '& code': {
            bgcolor: 'grey.100',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.875rem'
          },
          '& a': {
            color: colors.primary,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }
        }}
        dangerouslySetInnerHTML={{ 
          __html: formData.content || '<p style="color: #999; font-style: italic;">Содержимое появится здесь...</p>' 
        }}
      />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Заголовок и навигация */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={() => navigate('/articles')}
              sx={{ mr: 2, color: colors.textSecondary }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 700, 
                color: colors.textPrimary,
                mb: 1
              }}>
                {mode === 'create' ? '✏️ Создание статьи' : '📝 Редактирование статьи'}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: colors.textSecondary,
                fontSize: '1.1rem'
              }}>
                {mode === 'create' ? 'Создайте новую полезную статью для клиентов' : 'Внесите изменения в статью'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={previewMode ? <EditIcon /> : <PreviewIcon />}
                onClick={() => setPreviewMode(!previewMode)}
                sx={secondaryButtonStyles}
              >
                {previewMode ? 'Редактировать' : 'Предпросмотр'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(ARTICLE_STATUSES.DRAFT)}
                disabled={loading || !formData.title || !formData.content}
                sx={buttonStyles}
              >
                {loading ? <CircularProgress size={20} /> : 'Сохранить'}
              </Button>
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={() => handleSubmit(ARTICLE_STATUSES.PUBLISHED)}
                disabled={loading || !formData.title || !formData.content || !formData.excerpt}
                sx={getButtonStyles(theme, 'success')}
              >
                Опубликовать
              </Button>
            </Box>
          </Box>

          {/* Уведомления */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              ❌ {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              ✅ {success}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Основная форма */}
      {previewMode ? (
        <Fade in timeout={300}>
          {renderPreview()}
        </Fade>
      ) : (
        <Fade in timeout={300}>
          <Box sx={cardStyles}>
            {/* Табы */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(value) => setActiveTab(typeof value === 'string' ? parseInt(value) : value)}
                tabs={[
                  { label: 'Основное', value: 0, icon: <EditIcon /> },
                  { label: 'SEO и медиа', value: 1, icon: <SearchIcon /> },
                  { label: 'Настройки', value: 2, icon: <SettingsIcon /> }
                ]}
              />
            </Box>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Основная информация */}
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Заголовок статьи *"
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      placeholder="Введите заголовок статьи"
                      sx={textFieldStyles}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Select
                      fullWidth
                      label="Категория"
                      value={formData.category}
                      onChange={(value) => handleInputChange('category')(value)}
                      options={categories.map((category: { key: string; name: string; icon: string }) => ({
                        value: category.key,
                        label: `${category.icon} ${category.name}`
                      }))}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Select
                      fullWidth
                      label="Статус"
                      value={formData.status}
                      onChange={(value) => handleInputChange('status')(value)}
                      options={[
                        { value: 'draft', label: 'Черновик' },
                        { value: 'published', label: 'Опубликовано' }
                      ]}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Краткое описание *"
                      value={formData.excerpt}
                      onChange={handleInputChange('excerpt')}
                      placeholder="Напишите краткое описание статьи"
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      required
                      helperText={`${formData.excerpt.length}/160 символов`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                      Содержимое статьи *
                    </Typography>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleInputChange('content')}
                      placeholder="Напишите полный текст статьи..."
                      height={500}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: colors.textPrimary }}>
                        Теги
                      </Typography>
                      <TextField
                        fullWidth
                        label="Добавить тег"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Введите тег и нажмите Enter"
                        sx={textFieldStyles}
                        helperText="Нажмите Enter или запятую для добавления тега"
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {formData.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => removeTag(tag)}
                            sx={getChipStyles(theme, 'primary')}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* SEO и медиа */}
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL изображения"
                      value={formData.featured_image_url}
                      onChange={handleInputChange('featured_image_url')}
                      placeholder="https://example.com/image.jpg"
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: <ImageIcon sx={{ mr: 1, color: colors.textSecondary }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SEO заголовок"
                      value={formData.meta_title}
                      onChange={handleInputChange('meta_title')}
                      placeholder="SEO заголовок для поисковых систем"
                      sx={textFieldStyles}
                      helperText={`${formData.meta_title.length}/60 символов`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SEO описание"
                      value={formData.meta_description}
                      onChange={handleInputChange('meta_description')}
                      placeholder="SEO описание для поисковых систем"
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      helperText={`${formData.meta_description.length}/160 символов`}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Настройки */}
              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Switch
                      checked={formData.featured}
                      onChange={(checked) => handleInputChange('featured')({ target: { checked } })}
                      label="Рекомендуемая статья"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Switch
                      checked={formData.allow_comments}
                      onChange={(checked) => handleInputChange('allow_comments')({ target: { checked } })}
                      label="Разрешить комментарии"
                    />
                  </Grid>
                </Grid>
              </TabPanel>
            </form>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default ArticleForm; 