import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Chip,
  FormHelperText,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  LocalOffer as KeywordsIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

// Импорт UI компонентов
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';

// Импорт стилей
import { getCardStyles } from '../../styles';

interface SEOMetatagsEditorProps {
  initialData?: {
    title: string;
    description: string;
    keywords: string[];
    image?: string;
    canonical?: string;
    noIndex?: boolean;
  };
  onSave: (data: SEOFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface SEOFormData {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  canonical: string;
  noIndex: boolean;
}

export const SEOMetatagsEditor: React.FC<SEOMetatagsEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);

  // Состояние формы
  const [formData, setFormData] = useState<SEOFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    keywords: initialData?.keywords || [],
    image: initialData?.image || '',
    canonical: initialData?.canonical || '',
    noIndex: initialData?.noIndex || false,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length < 30) {
      newErrors.title = 'Заголовок слишком короткий (минимум 30 символов)';
    } else if (formData.title.length > 60) {
      newErrors.title = 'Заголовок слишком длинный (максимум 60 символов)';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length < 120) {
      newErrors.description = 'Описание слишком короткое (минимум 120 символов)';
    } else if (formData.description.length > 160) {
      newErrors.description = 'Описание слишком длинное (максимум 160 символов)';
    }

    if (formData.keywords.length < 3) {
      newErrors.keywords = 'Добавьте минимум 3 ключевых слова';
    } else if (formData.keywords.length > 15) {
      newErrors.keywords = 'Максимум 15 ключевых слов';
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Некорректный URL изображения';
    }

    if (formData.canonical && !isValidUrl(formData.canonical)) {
      newErrors.canonical = 'Некорректный канонический URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') && url.length > 1;
    }
  };

  // Обработчики
  const handleInputChange = (field: keyof SEOFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !formData.keywords.includes(keyword) && formData.keywords.length < 15) {
      setFormData(prev => ({ 
        ...prev, 
        keywords: [...prev.keywords, keyword] 
      }));
      setKeywordInput('');
      if (errors.keywords) {
        setErrors(prev => ({ ...prev, keywords: '' }));
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Статистика
  const getTitleStatus = () => {
    const length = formData.title.length;
    if (length < 30) return { color: 'error', text: 'Слишком короткий' };
    if (length > 60) return { color: 'error', text: 'Слишком длинный' };
    if (length >= 50 && length <= 60) return { color: 'success', text: 'Оптимальная длина' };
    return { color: 'warning', text: 'Можно улучшить' };
  };

  const getDescriptionStatus = () => {
    const length = formData.description.length;
    if (length < 120) return { color: 'error', text: 'Слишком короткое' };
    if (length > 160) return { color: 'error', text: 'Слишком длинное' };
    if (length >= 150 && length <= 160) return { color: 'success', text: 'Оптимальная длина' };
    return { color: 'warning', text: 'Можно улучшить' };
  };

  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Заголовок */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Заголовок страницы (Title)"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title || `${formData.title.length}/60 символов`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={titleStatus.text} 
              color={titleStatus.color as any} 
              size="small" 
            />
            <Typography variant="caption" color="text.secondary">
              Рекомендуемая длина: 50-60 символов
            </Typography>
          </Box>
        </Grid>

        {/* Описание */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Описание страницы (Description)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/160 символов`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={descriptionStatus.text} 
              color={descriptionStatus.color as any} 
              size="small" 
            />
            <Typography variant="caption" color="text.secondary">
              Рекомендуемая длина: 150-160 символов
            </Typography>
          </Box>
        </Grid>

        {/* Ключевые слова */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Добавить ключевое слово"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeywordInputKeyPress}
            placeholder="Введите ключевое слово и нажмите Enter"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeywordsIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    size="small" 
                    onClick={handleAddKeyword}
                    disabled={!keywordInput.trim() || formData.keywords.length >= 15}
                  >
                    Добавить
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          
          {/* Отображение ключевых слов */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Ключевые слова ({formData.keywords.length}/15):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.keywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={() => handleRemoveKeyword(keyword)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
            {errors.keywords && (
              <FormHelperText error>{errors.keywords}</FormHelperText>
            )}
          </Box>
        </Grid>

        {/* Изображение */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="URL изображения (Open Graph)"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            error={!!errors.image}
            helperText={errors.image || 'Рекомендуемый размер: 1200x630 пикселей'}
            placeholder="/image/page-image.jpg"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Канонический URL */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Канонический URL"
            value={formData.canonical}
            onChange={(e) => handleInputChange('canonical', e.target.value)}
            error={!!errors.canonical}
            helperText={errors.canonical || 'Оставьте пустым для автоматического определения'}
            placeholder="https://tvoya-shina.ua/page"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Настройки индексации */}
        <Grid item xs={12}>
          <Switch
            label="Запретить индексацию (noindex)"
            checked={formData.noIndex}
            onChange={(e) => handleInputChange('noIndex', e.target.checked)}
            icon={formData.noIndex ? <VisibilityOffIcon /> : <VisibilityIcon />}
          />
          <FormHelperText>
            Включите для приватных страниц (профиль, админка)
          </FormHelperText>
        </Grid>

        {/* Предварительный просмотр */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Предварительный просмотр в поисковой выдаче:
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              bgcolor: '#fafafa'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1a0dab', 
                  fontSize: '18px',
                  fontWeight: 400,
                  mb: 0.5,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {formData.title || 'Заголовок страницы'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#006621', mb: 0.5 }}>
                tvoya-shina.ua • {formData.canonical || 'auto-url'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#545454', lineHeight: 1.4 }}>
                {formData.description || 'Описание страницы будет отображаться здесь...'}
              </Typography>
            </Box>
          </Alert>
        </Grid>

        {/* Кнопки действий */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}; 