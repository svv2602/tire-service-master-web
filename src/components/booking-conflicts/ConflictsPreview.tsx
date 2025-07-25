import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Collapse,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { usePreviewBookingConflictsMutation, usePreviewBookingConflictsWithFormDataMutation, BookingConflict } from '../../api/bookingConflicts.api';

interface ConflictsPreviewProps {
  servicePointId?: number;
  seasonalScheduleId?: number;
  title?: string;
  description?: string;
  // Новые пропсы для работы с данными формы
  formData?: any;
  useFormData?: boolean;
}

const ConflictsPreview: React.FC<ConflictsPreviewProps> = ({
  servicePointId,
  seasonalScheduleId,
  title,
  description,
  formData,
  useFormData = false,
}) => {
  const { t } = useTranslation('components');
  const [isExpanded, setIsExpanded] = useState(false);
  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [conflictsCount, setConflictsCount] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [previewConflicts, { isLoading: isLoadingStandard }] = usePreviewBookingConflictsMutation();
  const [previewConflictsWithFormData, { isLoading: isLoadingWithFormData }] = usePreviewBookingConflictsWithFormDataMutation();

  const isLoading = isLoadingStandard || isLoadingWithFormData;

  const displayTitle = title || t('conflictsPreview.defaultTitle');
  const displayDescription = description || t('conflictsPreview.defaultDescription');

  const handlePreview = async () => {
    try {
      let result;
      
      if (useFormData && formData && servicePointId) {
        // Используем новый API с данными формы
        result = await previewConflictsWithFormData({
          service_point_id: servicePointId,
          form_data: formData
        }).unwrap();
      } else {
        // Используем стандартный API
        const params: any = {};
        if (servicePointId) params.service_point_id = servicePointId;
        if (seasonalScheduleId) params.seasonal_schedule_id = seasonalScheduleId;

        result = await previewConflicts(params).unwrap();
      }
      
      setConflicts(result.conflicts);
      setConflictsCount(result.count);
      setHasAnalyzed(true);
      
      if (result.count > 0) {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error(t('conflictsPreview.error'), error);
      setConflicts([]);
      setConflictsCount(0);
      setHasAnalyzed(true);
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <ScheduleIcon color="warning" />;
      case 'service_point_status':
        return <WarningIcon color="error" />;
      case 'post_status':
        return <CancelIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getSeverityColor = (count: number) => {
    if (count === 0) return 'success';
    if (count <= 3) return 'warning';
    return 'error';
  };

  // Функция для перевода причин конфликтов
  const translateConflictReason = (reason: string) => {
    // Проверяем паттерн "Нет рабочих постов для категории 'X' на Y"
    const noWorkingPostsMatch = reason.match(/Нет рабочих постов для категории '(.+)' на (.+)/);
    if (noWorkingPostsMatch) {
      const [, category, date] = noWorkingPostsMatch;
      return t('bookingConflicts.messages.noWorkingPosts', { category, date });
    }
    
    // Проверяем другие стандартные сообщения
    if (reason === 'Выбранный слот недоступен') {
      return t('bookingConflicts.messages.availabilityCheckFailed');
    }
    
    return reason;
  };

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PreviewIcon color="primary" />
            <Typography variant="h6">{displayTitle}</Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <PreviewIcon />}
          >
            {isLoading ? t('conflictsPreview.analyzing') : t('conflictsPreview.checkConflicts')}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {displayDescription}
        </Typography>

        {hasAnalyzed && (
          <>
            <Alert 
              severity={getSeverityColor(conflictsCount) as any}
              sx={{ mb: 2 }}
              action={
                conflictsCount > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => setIsExpanded(!isExpanded)}
                    color="inherit"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )
              }
            >
              <Typography variant="body2">
                {conflictsCount === 0 
                  ? t('conflictsPreview.noConflicts')
                  : t('conflictsPreview.conflictsFound', { count: conflictsCount })
                }
              </Typography>
            </Alert>

            <Collapse in={isExpanded && conflictsCount > 0}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {t('conflictsPreview.conflictDetails')}
                </Typography>
                
                {conflicts.map((conflict, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(255, 193, 7, 0.1)' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {getConflictTypeIcon(conflict.conflict_type)}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {t(`bookingConflicts.conflictType.${conflict.conflict_type}`)}
                            </Typography>
                            <Chip 
                              label={t('conflictsPreview.conflictInfo.potential')}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {translateConflictReason(conflict.conflict_reason)}
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">
                                {t('conflictsPreview.conflictInfo.booking')}
                              </Typography>
                              <Typography variant="body2">
                                ID: {conflict.booking.id}<br />
                                {t('bookingConflicts.bookingInfo.date')}: {conflict.booking.start_time ? new Date(conflict.booking.start_time).toLocaleDateString('ru-RU') : t('bookingConflicts.bookingInfo.notSpecifiedDate')}<br />
                                {t('bookingConflicts.bookingInfo.time')}: {conflict.booking.start_time ? new Date(conflict.booking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : t('bookingConflicts.bookingInfo.notSpecifiedTime')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">
                                {t('conflictsPreview.conflictInfo.client')}
                              </Typography>
                              <Typography variant="body2">
                                {conflict.booking.client.name}<br />
                                {conflict.booking.client.email}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                
                {conflictsCount > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('conflictsPreview.recommendation.title')}</strong> {t('conflictsPreview.recommendation.description')}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictsPreview; 