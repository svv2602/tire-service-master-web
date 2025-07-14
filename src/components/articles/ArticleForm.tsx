import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    featured_image_url: '',
    allow_comments: true,
    tags: [],
    // Русские поля
    title_ru: '',
    content_ru: '',
    excerpt_ru: '',
    meta_title_ru: '',
    meta_description_ru: '',
    // Украинские поля
    title_uk: '',
    content_uk: '',
    excerpt_uk: '',
    meta_title_uk: '',
    meta_description_uk: '',
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
        featured_image_url: article.featured_image || '',
        allow_comments: (article as Article).allow_comments ?? true,
        tags: (article as Article).tags || [],
        // Русские поля
        title_ru: (article as Article).title_ru || '',
        content_ru: (article as Article).content_ru || '',
        excerpt_ru: (article as Article).excerpt_ru || '',
        meta_title_ru: (article as Article).meta_title_ru || '',
        meta_description_ru: (article as Article).meta_description_ru || '',
        // Украинские поля
        title_uk: (article as Article).title_uk || '',
        content_uk: (article as Article).content_uk || '',
        excerpt_uk: (article as Article).excerpt_uk || '',
        meta_title_uk: (article as Article).meta_title_uk || '',
        meta_description_uk: (article as Article).meta_description_uk || '',
      });
    }
  }, [mode, article]);

  // Автоматическое заполнение SEO полей
  useEffect(() => {
    if (formData.title && !formData.meta_title_ru) {
      setFormData(prev => ({
        ...prev,
        meta_title_ru: prev.title.slice(0, 60),
      }));
    }
    if (formData.excerpt && !formData.meta_description_ru) {
      setFormData(prev => ({
        ...prev,
        meta_description_ru: prev.excerpt.slice(0, 160),
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
      featured_image_url: formData.featured_image_url || undefined,
      allow_comments: formData.allow_comments,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      // Русские поля
      title_ru: formData.title_ru,
      content_ru: formData.content_ru,
      excerpt_ru: formData.excerpt_ru,
      meta_title_ru: formData.meta_title_ru || undefined,
      meta_description_ru: formData.meta_description_ru || undefined,
      // Украинские поля
      title_uk: formData.title_uk,
      content_uk: formData.content_uk,
      excerpt_uk: formData.excerpt_uk,
      meta_title_uk: formData.meta_title_uk || undefined,
      meta_description_uk: formData.meta_description_uk || undefined,
    };

    let result;
    
    if (mode === 'create') {
      result = await createArticle(articleData);
    } else if (mode === 'edit' && article) {
      result = await updateArticle(article.id, articleData);
    }

    if (result?.success) {
      setSuccess(publishStatus === 'published' ? t('forms.articles.form.messages.publishSuccess') : t('forms.articles.form.messages.saveSuccess'));
      setTimeout(() => navigate('/admin/articles'), 1500);
    } else if (result?.error) {
      setError(result.error);
    }
  };

  // Рендер предпросмотра
  const renderPreview = () => (
    <Box sx={{ ...cardStyles, mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2, color: colors.textPrimary }}>
        {formData.title || t('forms.articles.form.preview.titleFallback')}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: colors.textSecondary }}>
        {formData.excerpt || t('forms.articles.form.preview.excerptFallback')}
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
          __html: formData.content || t('forms.articles.form.preview.contentFallback')
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
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/articles')}
              sx={{ mr: 2, ...secondaryButtonStyles }}
            >
              {t('common.back')}
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 700, 
                color: colors.textPrimary,
                mb: 1
              }}>
                {mode === 'create' ? t('forms.articles.form.createTitle') : t('forms.articles.form.editTitle')}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: colors.textSecondary,
                fontSize: '1.1rem'
              }}>
                {mode === 'create' ? t('forms.articles.form.createSubtitle') : t('forms.articles.form.editSubtitle')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={previewMode ? <EditIcon /> : <PreviewIcon />}
                onClick={() => setPreviewMode(!previewMode)}
                sx={secondaryButtonStyles}
              >
                {previewMode ? t('forms.articles.form.editButton') : t('forms.articles.form.previewButton')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(ARTICLE_STATUSES.DRAFT)}
                disabled={loading || !formData.title || !formData.content || !formData.title_uk || !formData.content_uk}
                sx={buttonStyles}
              >
                {loading ? <CircularProgress size={20} /> : t('forms.articles.form.saveButton')}
              </Button>
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={() => handleSubmit(ARTICLE_STATUSES.PUBLISHED)}
                disabled={loading || !formData.title || !formData.content || !formData.excerpt || !formData.title_uk || !formData.content_uk || !formData.excerpt_uk}
                sx={getButtonStyles(theme, 'success')}
              >
                {t('forms.articles.form.publishButton')}
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
            {/* Табы для языков и настроек */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(value) => setActiveTab(typeof value === 'string' ? parseInt(value) : value)}
                                  tabs={[
                    { label: t('forms.articles.form.tabs.russian'), value: 0, icon: <EditIcon /> },
                    { label: t('forms.articles.form.tabs.ukrainian'), value: 1, icon: <EditIcon /> },
                    { label: t('forms.articles.form.tabs.seoMedia'), value: 2, icon: <SearchIcon /> },
                    { label: t('forms.articles.form.tabs.settings'), value: 3, icon: <SettingsIcon /> }
                  ]}
              />
            </Box>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Русский язык */}
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.titleRu')}
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      placeholder={t('forms.articles.form.fields.titlePlaceholder')}
                      sx={textFieldStyles}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.excerptRu')}
                      value={formData.excerpt}
                      onChange={handleInputChange('excerpt')}
                      placeholder={t('forms.articles.form.fields.excerptPlaceholder')}
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      required
                      helperText={`${formData.excerpt.length}/160 ${t('forms.articles.form.fields.excerptMaxLength')}`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                      {t('forms.articles.form.fields.contentRu')}
                    </Typography>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleInputChange('content')}
                      placeholder={t('forms.articles.form.fields.contentPlaceholder')}
                      height={400}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.metaTitleRu')}
                      value={formData.meta_title_ru || ''}
                      onChange={handleInputChange('meta_title_ru')}
                      placeholder={t('forms.articles.form.fields.metaTitlePlaceholder')}
                      sx={textFieldStyles}
                      helperText={`${(formData.meta_title_ru || '').length}/60 ${t('forms.articles.form.fields.metaTitleMaxLength')}`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.metaDescriptionRu')}
                      value={formData.meta_description_ru || ''}
                      onChange={handleInputChange('meta_description_ru')}
                      placeholder={t('forms.articles.form.fields.metaDescriptionPlaceholder')}
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      helperText={`${(formData.meta_description_ru || '').length}/160 ${t('forms.articles.form.fields.metaDescriptionMaxLength')}`}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Украинский язык */}
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.titleUk')}
                      value={formData.title_uk}
                      onChange={handleInputChange('title_uk')}
                      placeholder={t('forms.articles.form.fields.titlePlaceholder')}
                      sx={textFieldStyles}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.excerptUk')}
                      value={formData.excerpt_uk}
                      onChange={handleInputChange('excerpt_uk')}
                      placeholder={t('forms.articles.form.fields.excerptPlaceholder')}
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      required
                      helperText={`${(formData.excerpt_uk || '').length}/160 ${t('forms.articles.form.fields.excerptMaxLength')}`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                      {t('forms.articles.form.fields.contentUk')}
                    </Typography>
                    <RichTextEditor
                      value={formData.content_uk || ''}
                      onChange={handleInputChange('content_uk')}
                      placeholder={t('forms.articles.form.fields.contentPlaceholder')}
                      height={400}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.metaTitleUk')}
                      value={formData.meta_title_uk}
                      onChange={handleInputChange('meta_title_uk')}
                      placeholder={t('forms.articles.form.fields.metaTitlePlaceholder')}
                      sx={textFieldStyles}
                      helperText={`${(formData.meta_title_uk || '').length}/60 ${t('forms.articles.form.fields.metaTitleMaxLength')}`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.metaDescriptionUk')}
                      value={formData.meta_description_uk}
                      onChange={handleInputChange('meta_description_uk')}
                      placeholder={t('forms.articles.form.fields.metaDescriptionPlaceholder')}
                      multiline
                      rows={3}
                      sx={textFieldStyles}
                      helperText={`${(formData.meta_description_uk || '').length}/160 ${t('forms.articles.form.fields.metaDescriptionMaxLength')}`}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* SEO и медиа */}
              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Select
                      fullWidth
                      label={t('forms.articles.form.fields.category')}
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
                      label={t('forms.articles.form.fields.status')}
                      value={formData.status}
                      onChange={(value) => handleInputChange('status')(value)}
                      options={[
                        { value: 'draft', label: t('forms.articles.form.statusOptions.draft') },
                        { value: 'published', label: t('forms.articles.form.statusOptions.published') }
                      ]}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('forms.articles.form.fields.featuredImage')}
                      value={formData.featured_image_url}
                      onChange={handleInputChange('featured_image_url')}
                      placeholder={t('forms.articles.form.fields.featuredImagePlaceholder')}
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: <ImageIcon sx={{ mr: 1, color: colors.textSecondary }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: colors.textPrimary }}>
                        {t('forms.articles.form.fields.tags')}
                      </Typography>
                      <TextField
                        fullWidth
                        label={t('forms.articles.form.fields.addTag')}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={t('forms.articles.form.fields.tagsPlaceholder')}
                        sx={textFieldStyles}
                        helperText={t('forms.articles.form.fields.tagsHelper')}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {formData.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => removeTag(tag)}
                            color="primary"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Настройки */}
              <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Switch
                      checked={formData.featured}
                      onChange={(checked) => handleInputChange('featured')({ target: { checked } })}
                      label={t('forms.articles.form.fields.featured')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Switch
                      checked={formData.allow_comments}
                      onChange={(checked) => handleInputChange('allow_comments')({ target: { checked } })}
                      label={t('forms.articles.form.fields.allowComments')}
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