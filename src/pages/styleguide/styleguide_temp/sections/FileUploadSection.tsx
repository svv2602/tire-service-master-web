import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import FileUpload, { FileUploadProps } from '../../../../components/ui/FileUpload';

export const FileUploadSection: React.FC = () => {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [files3, setFiles3] = useState<File[]>([]);

  const handleFileChange = (files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    setFiles(files);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        FileUpload
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовая загрузка
          </Typography>
          <FileUpload
            onFilesSelected={(files: File[]) => handleFileChange(files, setFiles1)}
            accept="image/*"
            maxFiles={1}
            label="Загрузить изображение"
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Выбрано файлов: {files1.length}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Мультизагрузка
          </Typography>
          <FileUpload
            onFilesSelected={(files: File[]) => handleFileChange(files, setFiles2)}
            accept="image/*"
            maxFiles={5}
            multiple
            label="Загрузить изображения (до 5 шт.)"
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Выбрано файлов: {files2.length} из 5
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С ограничением размера
          </Typography>
          <FileUpload
            onFilesSelected={(files: File[]) => handleFileChange(files, setFiles3)}
            accept=".pdf,.doc,.docx"
            maxSize={5 * 1024 * 1024} // 5MB
            label="Загрузить документ (макс. 5MB)"
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Выбрано файлов: {files3.length}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileUploadSection;