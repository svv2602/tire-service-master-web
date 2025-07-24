import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Divider,
  Alert,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as PreviewIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { Button } from '../ui/Button';
import { usePreviewEmailTemplateMutation, useGetEmailTemplateQuery } from '../../api/emailTemplates.api';

interface EmailTemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  templateId?: number;
  templateData?: {
    subject: string;
    body: string;
    template_type: string;
    channel_type?: string;
    variables?: string[];
  };
  customVariables?: Record<string, string>;
}

/**
 * Универсальный компонент модального окна для предварительного просмотра email шаблонов
 * 
 * Может работать в двух режимах:
 * 1. С сохраненным шаблоном (templateId) - загружает данные через API
 * 2. С данными формы (templateData) - использует переданные данные для локального рендеринга
 */
const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  open,
  onClose,
  templateId,
  templateData,
  customVariables = {},
}) => {
  const theme = useTheme();
  const [previewEmailTemplate, { isLoading, error }] = usePreviewEmailTemplateMutation();
  
  // Загружаем данные шаблона если используется templateId
  const { data: templateDataFromApi } = useGetEmailTemplateQuery(
    templateId || 0,
    { skip: !templateId }
  );
  
  const [previewData, setPreviewData] = useState<{
    subject: string;
    body: string;
    variables_used?: Record<string, string>;
    available_variables?: string[];
  } | null>(null);

  // Системные переменные для предварительного просмотра
  const getSystemVariables = (templateType: string) => {
    const baseVariables: Record<string, string> = {
      // Клиент
      'client_name': 'Іван Петренко',
      'client_email': 'ivan.petrenko@example.com', 
      'client_phone': '+38 (067) 123-45-67',
      'client_first_name': 'Іван',
      'client_last_name': 'Петренко',
      
      // Сервисная точка
      'service_point_name': 'СТО Центральний',
      'service_point_address': 'вул. Хрещатик, 1, Київ',
      'service_point_phone': '+38 (044) 555-12-34',
      'service_point_city': 'Київ',
      
      // Система
      'company_name': 'Tire Service Master',
      'support_email': 'support@tireservice.ua',
      'support_phone': '+38 (044) 111-22-33',
      'website_url': 'https://tireservice.ua',
      'current_date': new Date().toLocaleDateString('uk-UA'),
      'current_time': new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    // Добавляем специфичные переменные в зависимости от типа шаблона
    if (templateType?.includes('booking')) {
      return {
        ...baseVariables,
        'booking_id': '#12345',
        'booking_date': '25.07.2025',
        'booking_time': '14:30',
        'booking_status': 'Підтверджено',
        'booking_notes': 'Додаткові побажання клієнта',
        'car_brand': 'Toyota',
        'car_model': 'Camry',
        'car_year': '2020',
        'license_plate': 'АА1234ВВ',
      };
    }

    if (templateType?.includes('review')) {
      return {
        ...baseVariables,
        'review_id': '#456',
        'review_number': '456',
        'rating': '5',
        'rating_stars': '⭐⭐⭐⭐⭐',
        'comment': 'Відмінний сервіс! Рекомендую!',
        'status': 'published',
        'status_text': 'Опубліковано'
      };
    }

    if (templateType?.includes('service')) {
      const serviceVariables = {
        ...baseVariables,
        'service_name': 'Заміна шин',
        'service_category': 'Шиномонтаж',
        'service_price': '1200 грн',
        'service_duration': '60 хвилин',
      };

      // Для service_completed добавляем переменные бронирования
      if (templateType.includes('completed')) {
        return {
          ...serviceVariables,
          'booking_id': '#12345',
          'booking_date': '25.07.2025',
          'booking_time': '14:30',
          'booking_status': 'Завершено',
          'car_brand': 'Toyota',
          'car_model': 'Camry',
          'car_year': '2020',
          'license_plate': 'АА1234ВВ',
        };
      }

      return serviceVariables;
    }

    return baseVariables;
  };

  // Мемоизируем customVariables для предотвращения лишних ререндеров
  const memoizedCustomVariables = useMemo(() => customVariables, [JSON.stringify(customVariables)]);
  
  // Мемоизируем templateData для предотвращения лишних ререндеров
  const memoizedTemplateData = useMemo(() => templateData, [
    templateData?.subject,
    templateData?.body,
    templateData?.template_type,
    JSON.stringify(templateData?.variables)
  ]);

  // Локальный рендеринг для данных формы
  const renderLocalPreview = useCallback((data: typeof templateData) => {
    if (!data) return;

    const systemVariables = getSystemVariables(data.template_type);
    const allVariables = { ...systemVariables, ...memoizedCustomVariables };

    let previewSubject = data.subject;
    let previewBody = data.body;

    // Заменяем переменные в фигурных скобках
    Object.entries(allVariables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewBody = previewBody.replace(regex, value);
    });

    setPreviewData({
      subject: previewSubject,
      body: previewBody,
      variables_used: allVariables,
      available_variables: data.variables || []
    });
  }, [memoizedCustomVariables]);

  // Загрузка предварительного просмотра через API
  const loadApiPreview = useCallback(async (id: number) => {
    try {
      // Получаем тип шаблона из загруженных данных API или из формы
      const templateType = templateDataFromApi?.data?.template_type || templateData?.template_type || '';
      const systemVariables = getSystemVariables(templateType);
      const allVariables = { ...systemVariables, ...memoizedCustomVariables };
      
      const result = await previewEmailTemplate({
        id,
        variables: allVariables
      }).unwrap();

      setPreviewData({
        subject: result.preview.subject,
        body: result.preview.body,
        variables_used: result.preview.variables_used,
        available_variables: result.preview.available_variables
      });
    } catch (err) {
      console.error('Ошибка загрузки предварительного просмотра:', err);
    }
  }, [previewEmailTemplate, memoizedCustomVariables, templateDataFromApi?.data?.template_type, templateData?.template_type]);

  // Эффект для загрузки данных при открытии модального окна
  useEffect(() => {
    if (!open) {
      setPreviewData(null);
      return;
    }

    if (templateId) {
      // Режим API - загружаем сохраненный шаблон
      loadApiPreview(templateId);
    } else if (memoizedTemplateData) {
      // Режим локального рендеринга - используем данные формы
      renderLocalPreview(memoizedTemplateData);
    }
  }, [open, templateId, memoizedTemplateData, loadApiPreview, renderLocalPreview]);

  // Копирование содержимого в буфер обмена
  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Можно добавить уведомление об успешном копировании
    } catch (err) {
      console.error('Ошибка копирования в буфер обмена:', err);
    }
  };

  const handleClose = () => {
    setPreviewData(null);
    onClose();
  };

  // Определяем тип канала для корректного отображения
  const getChannelType = () => {
    if (templateId && templateDataFromApi?.data?.channel_type) {
      return templateDataFromApi.data.channel_type;
    }
    if (templateData?.channel_type) {
      return templateData.channel_type;
    }
    return 'email'; // По умолчанию email
  };

  const channelType = getChannelType();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PreviewIcon />
          <Typography variant="h6">
            Предварительный просмотр шаблона
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ошибка загрузки предварительного просмотра. Проверьте данные шаблона.
          </Alert>
        )}

        {previewData && (
          <>
            {/* Предварительный просмотр темы */}
            <Paper sx={{ 
              p: 2, 
              mb: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 'bold'
                }}>
                  Тема письма:
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopyToClipboard(previewData.subject, 'тема')}
                  sx={{ ml: 1 }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography
                variant="body1"
                sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 500
                }}
              >
                {previewData.subject}
              </Typography>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Предварительный просмотр содержимого */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              minHeight: '200px'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 'bold'
                }}>
                  {channelType === 'email' && 'Предварительный просмотр письма:'}
                  {channelType === 'telegram' && 'Предварительный просмотр Telegram сообщения:'}
                  {channelType === 'push' && 'Предварительный просмотр Push уведомления:'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopyToClipboard(previewData.body, 'содержимое')}
                  sx={{ ml: 1 }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Условное отображение в зависимости от типа канала */}
              {channelType === 'email' ? (
                <>
                  {/* Подсказка для темной темы */}
                  {theme.palette.mode === 'dark' && (
                    <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                      📧 Email отображается на белом фоне как в реальных почтовых клиентах
                    </Alert>
                  )}
                  
                  {/* HTML рендеринг для email */}
                  <Box
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: 'white', // Email всегда на белом фоне
                    minHeight: '300px',
                    overflow: 'auto',
                    // Дополнительная рамка для темной темы для лучшей видимости
                    ...(theme.palette.mode === 'dark' && {
                      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                    }),
                    '& *': {
                      maxWidth: '100% !important'
                    },
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto'
                    },
                    '& table': {
                      width: '100%',
                      borderCollapse: 'collapse'
                    },
                    // Гарантируем видимость текста в HTML контенте
                    '& body': {
                      color: '#333 !important',
                      backgroundColor: 'white !important'
                    },
                    '& p, & div, & span, & td, & th, & li': {
                      color: '#333 !important'
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      color: '#222 !important'
                    },
                    // Обеспечиваем контрастность ссылок
                    '& a': {
                      color: '#1976d2 !important'
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                  />
                </>
              ) : (
                // Текстовый просмотр для Telegram и Push
                <Box
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: (channelType as string) === 'telegram' 
                      ? (theme.palette.mode === 'dark' ? 'grey.800' : '#f8f9fa')
                      : (theme.palette.mode === 'dark' ? 'grey.700' : '#fff3e0'),
                    minHeight: '300px',
                    p: 2,
                    fontFamily: (channelType as string) === 'telegram' ? 'monospace' : 'inherit'
                  }}
                >
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: 1.6,
                      color: theme.palette.text.primary,
                      fontSize: (channelType as string) === 'telegram' ? '14px' : '16px'
                    }}
                  >
                    {previewData.body}
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailTemplatePreviewModal; 