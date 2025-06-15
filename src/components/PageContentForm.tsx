import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { 
  PageContent, 
  CreatePageContentRequest, 
  UpdatePageContentRequest,
  CONTENT_TYPES 
} from '../api/pageContent.api';

interface PageContentFormProps {
  initialData?: PageContent;
  onSubmit: (data: CreatePageContentRequest | UpdatePageContentRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Секции
const SECTIONS = [
  { key: 'client_main', name: 'Головна сторінка клієнта' },
  { key: 'admin_dashboard', name: 'Панель адміністратора' },
  { key: 'partner_portal', name: 'Портал партнера' },
  { key: 'knowledge_base', name: 'База знань' },
  { key: 'about', name: 'Про нас' },
  { key: 'contacts', name: 'Контакти' },
];

// Категории услуг
const SERVICE_CATEGORIES = [
  'Шиномонтаж',
  'Балансування',
  'Ремонт',
  'Діагностика',
  'Зберігання',
  'Консультації',
];

const PageContentForm: React.FC<PageContentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreatePageContentRequest>({
    section: '',
    content_type: '',
    title: '',
    content: '',
    settings: {},
    position: 1,
    active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        section: initialData.section,
        content_type: initialData.content_type,
        title: initialData.title,
        content: initialData.content,
        settings: initialData.settings || {},
        position: initialData.position,
        active: initialData.active,
      });
      
      if (initialData.image_url) {
        setImagePreview(initialData.image_url);
      }
      
      if (initialData.gallery_image_urls) {
        setGalleryPreviews(initialData.gallery_image_urls);
      }
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.section) newErrors.section = 'Секція обов\'язкова';
    if (!formData.content_type) newErrors.content_type = 'Тип контенту обов\'язковий';
    if (!formData.title) newErrors.title = 'Заголовок обов\'язковий';
    if (!formData.content) newErrors.content = 'Контент обов\'язковий';
    if (formData.position !== undefined && formData.position < 1) newErrors.position = 'Позиція повинна бути більше 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreatePageContentRequest | UpdatePageContentRequest = {
      ...formData,
      image: imageFile || undefined,
      gallery_images: galleryFiles.length > 0 ? galleryFiles : undefined,
    };

    if (initialData) {
      (submitData as UpdatePageContentRequest).id = initialData.id;
    }

    onSubmit(submitData);
  };

  const currentContentType = CONTENT_TYPES[formData.content_type];
  const settingsFields = currentContentType?.settings_fields || [];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Редагувати контент' : 'Створити новий контент'}
      </Typography>

      <Grid container spacing={3}>
        {/* Основные поля */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.section}>
            <InputLabel>Секція</InputLabel>
            <Select
              value={formData.section}
              onChange={(e) => handleInputChange('section', e.target.value)}
              label="Секція"
            >
              {SECTIONS.map((section) => (
                <MenuItem key={section.key} value={section.key}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
            {errors.section && (
              <Typography variant="caption" color="error">
                {errors.section}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.content_type}>
            <InputLabel>Тип контенту</InputLabel>
            <Select
              value={formData.content_type}
              onChange={(e) => handleInputChange('content_type', e.target.value)}
              label="Тип контенту"
            >
              {Object.values(CONTENT_TYPES).map((type) => (
                <MenuItem key={type.key} value={type.key}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {errors.content_type && (
              <Typography variant="caption" color="error">
                {errors.content_type}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Заголовок"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Контент"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
            multiline
            rows={4}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Позиція"
            type="number"
            value={formData.position}
            onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 1)}
            error={!!errors.position}
            helperText={errors.position}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
              />
            }
            label="Активний"
          />
        </Grid>

        {/* Настройки в зависимости от типа контента */}
        {settingsFields.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Налаштування
            </Typography>
            <Grid container spacing={2}>
              {settingsFields.map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  {field === 'category' && formData.content_type === 'service' ? (
                    <Autocomplete
                      options={SERVICE_CATEGORIES}
                      value={formData.settings?.[field] || ''}
                      onChange={(_, value) => handleSettingsChange(field, value)}
                      renderInput={(params) => (
                        <TextField {...params} label="Категорія" />
                      )}
                      freeSolo
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                      value={formData.settings?.[field] || ''}
                      onChange={(e) => handleSettingsChange(field, e.target.value)}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Загрузка изображения */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Зображення
          </Typography>
          
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
                startIcon={<UploadIcon />}
                sx={{ mr: 2 }}
              >
                Завантажити зображення
              </Button>
            </label>
            
            {imagePreview && (
              <IconButton onClick={removeImage} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {imagePreview && (
            <Card sx={{ maxWidth: 300, mb: 2 }}>
              <CardMedia
                component="img"
                height="200"
                image={imagePreview}
                alt="Попередній перегляд"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Попередній перегляд зображення
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Галерея изображений */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Галерея зображень
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="gallery-upload"
              type="file"
              multiple
              onChange={handleGalleryUpload}
            />
            <label htmlFor="gallery-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddIcon />}
              >
                Додати зображення в галерею
              </Button>
            </label>
          </Box>

          {galleryPreviews.length > 0 && (
            <Grid container spacing={2}>
              {galleryPreviews.map((preview, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="120"
                      image={preview}
                      alt={`Галерея ${index + 1}`}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => removeGalleryImage(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Информация о типе контента */}
        {currentContentType && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{currentContentType.name}:</strong> {currentContentType.description}
              </Typography>
              {settingsFields.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Доступні налаштування: {settingsFields.map(field => (
                      <Chip key={field} label={field} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Typography>
                </Box>
              )}
            </Alert>
          </Grid>
        )}

        {/* Кнопки действий */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Збереження...' : (initialData ? 'Оновити' : 'Створити')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PageContentForm; 