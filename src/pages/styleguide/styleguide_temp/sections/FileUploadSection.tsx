import React from 'react';
import { Typography, Grid } from '@mui/material';
import FileUpload from '../../../../components/ui/FileUpload';
import { Card } from '../../../../components/ui/Card';

/**
 * Секция StyleGuide для демонстрации компонента FileUpload
 */
export const FileUploadSection: React.FC = () => {
  return (
    <Card>
      <Typography variant="h4" gutterBottom>
        FileUpload
      </Typography>
      <Typography variant="body1" paragraph>
        Компонент для загрузки файлов с поддержкой drag&drop, предпросмотром и индикацией прогресса.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Базовый вариант
          </Typography>
          <FileUpload />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Загрузка изображений
          </Typography>
          <FileUpload
            accept=".jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            dropzoneText="Перетащите изображения или нажмите для выбора"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Множественная загрузка
          </Typography>
          <FileUpload
            multiple
            dropzoneText="Выберите несколько файлов"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Загрузка документов
          </Typography>
          <FileUpload
            accept=".pdf,.doc,.docx"
            maxSize={10 * 1024 * 1024}
            dropzoneText="Загрузите документы"
          />
        </Grid>
      </Grid>
    </Card>
  );
};

// Экспорт по умолчанию для использования в других модулях
export default FileUploadSection; 