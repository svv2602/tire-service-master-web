import React, { useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import FileUpload, { FileUploadProps } from '../../../../components/ui/FileUpload';

const sectionStyle = {
  p: 3,
  mb: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const uploadContainerStyle = {
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.default',
};

export const FileUploadSection: React.FC = () => {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [files3, setFiles3] = useState<File[]>([]);

  const handleFileChange = (files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    setFiles(files);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        FileUpload
      </Typography>

      <Paper sx={sectionStyle}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          Примеры загрузки файлов
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={uploadContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={uploadContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={uploadContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FileUploadSection;