import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import FileUpload from './FileUpload';
import { FileUploadProps, FileInfo } from './types';
import { Box, Typography, Button, Alert, Paper, Chip, Stack } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';

export default {
  title: 'UI/FileUpload',
  component: FileUpload,
  argTypes: {
    accept: {
      control: 'text',
      description: 'Разрешенные типы файлов',
    },
    maxSize: {
      control: 'number',
      description: 'Максимальный размер файла в байтах',
    },
    multiple: {
      control: 'boolean',
      description: 'Разрешить выбор нескольких файлов',
    },
    dropzoneText: {
      control: 'text',
      description: 'Текст для зоны перетаскивания',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Компонент для загрузки файлов с поддержкой drag&drop, проверкой типов и размеров файлов.',
      },
    },
  },
} as Meta;

const Template: Story<FileUploadProps> = (args) => <FileUpload {...args} />;

export const Default = Template.bind({});
Default.args = {
  onFilesSelected: () => {},
};

export const WithImageRestrictions = Template.bind({});
WithImageRestrictions.args = {
  accept: '.jpg,.jpeg,.png',
  maxSize: 5 * 1024 * 1024, // 5MB
  dropzoneText: 'Перетащите изображения или нажмите для выбора',
  onFilesSelected: () => {},
};

export const MultipleFiles = Template.bind({});
MultipleFiles.args = {
  multiple: true,
  dropzoneText: 'Выберите несколько файлов',
  onFilesSelected: () => {},
};

export const DocumentUpload = Template.bind({});
DocumentUpload.args = {
  accept: '.pdf,.doc,.docx',
  maxSize: 10 * 1024 * 1024, // 10MB
  dropzoneText: 'Загрузите документы',
  onFilesSelected: () => {},
};

// Интерактивные примеры
export const InteractiveExample = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setUploadStatus('Файлы выбраны');
    setError('');
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setError('Пожалуйста, выберите файлы для загрузки');
      return;
    }

    setUploadStatus('Загрузка...');
    
    // Имитация загрузки
    setTimeout(() => {
      setUploadStatus('Файлы успешно загружены');
    }, 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon color="primary" />;
    if (type.includes('pdf')) return <PictureAsPdfIcon color="error" />;
    return <DescriptionIcon color="info" />;
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Загрузка файлов
        </Typography>
        
        <FileUpload
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          multiple={true}
          maxSize={10 * 1024 * 1024}
          dropzoneText="Перетащите файлы или нажмите для выбора"
          onFilesSelected={handleFilesSelected}
        />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Выбрано файлов: {files.length}
            </Typography>
            
            <Stack spacing={1} sx={{ mt: 1, mb: 2 }}>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  icon={getFileIcon(file.type)}
                  label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                  variant="outlined"
                />
              ))}
            </Stack>
            
            <Button
              variant="contained"
              startIcon={<AttachFileIcon />}
              onClick={handleUpload}
              sx={{ mt: 1 }}
            >
              Загрузить файлы
            </Button>
          </Box>
        )}
        
        {uploadStatus && (
          <Alert 
            severity={uploadStatus === 'Загрузка...' ? 'info' : 'success'} 
            sx={{ mt: 2 }}
          >
            {uploadStatus}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export const ProfilePhotoUpload = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setLoading(true);
      
      // Имитация загрузки и преобразования в URL
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatar(reader.result as string);
          setLoading(false);
        };
        reader.readAsDataURL(files[0]);
      }, 1000);
    }
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Загрузка фото профиля
        </Typography>
        
        {avatar ? (
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={avatar}
              alt="Avatar"
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                mb: 2
              }}
            />
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setAvatar(null)}
            >
              Удалить фото
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <PersonIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            </Box>
          </Box>
        )}
        
        <FileUpload
          accept=".jpg,.jpeg,.png"
          multiple={false}
          maxSize={2 * 1024 * 1024}
          dropzoneText={loading ? "Загрузка..." : "Выберите фото"}
          onFilesSelected={handleFilesSelected}
          label="Загрузить фото профиля"
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Поддерживаемые форматы: JPG, PNG. Максимальный размер: 2 МБ
        </Typography>
      </Paper>
    </Box>
  );
}; 