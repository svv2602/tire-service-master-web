import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Card } from '../../../../components/ui/Card';
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
      <Typography variant="h6" gutterBottom>
        FileUpload
      </Typography>

      <Card title="Примеры загрузки файлов">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Базовая загрузка</Typography>
            <FileUpload
              onFilesSelected={(files: File[]) => handleFileChange(files, setFiles1)}
              accept="image/*"
              maxFiles={1}
              label="Загрузить изображение"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Мультизагрузка</Typography>
            <FileUpload
              onFilesSelected={(files: File[]) => handleFileChange(files, setFiles2)}
              accept="image/*"
              maxFiles={5}
              multiple
              label="Загрузить изображения (до 5 шт.)"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>С ограничением размера</Typography>
            <FileUpload
              onFilesSelected={(files: File[]) => handleFileChange(files, setFiles3)}
              accept=".pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
              label="Загрузить документ (макс. 5MB)"
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default FileUploadSection;