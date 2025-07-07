import React, { useCallback, useState, useRef } from 'react';
import { Box, Typography, LinearProgress, IconButton } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileUploadProps, FileInfo, FileUploadStatus } from './types';
import { tokens } from '../../../styles/theme/tokens';
import { useTranslation } from 'react-i18next';

// Стилизованные компоненты
const UploadBox = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    border: '2px dashed',
    borderColor: themeColors.borderPrimary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: themeColors.backgroundPrimary,
    transition: `all ${tokens.transitions.duration.fast} ${tokens.transitions.easing.easeInOut}`,
    
    '&:hover': {
      borderColor: themeColors.primary,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.02)',
    },
    
    '&.dragActive': {
      borderColor: themeColors.primary,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
    },
  };
});

const FileItem = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.md,
    border: '1px solid',
    borderColor: themeColors.borderPrimary,
    borderRadius: tokens.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: themeColors.backgroundSecondary,
    transition: tokens.transitions.duration.normal,
  };
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    marginTop: tokens.spacing.sm,
    height: 6,
    borderRadius: tokens.borderRadius.pill,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    
    '& .MuiLinearProgress-bar': {
      borderRadius: tokens.borderRadius.pill,
      backgroundColor: themeColors.primary,
    },
  };
});

/**
 * Компонент FileUpload - для загрузки файлов с поддержкой drag&drop
 */
const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  multiple = false,
  dropzoneText,
  onUploadSuccess,
  onUploadError,
  onProgress,
  sx,
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<FileUploadStatus>('idle');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  const effectiveDropzoneText = dropzoneText || t('fileUpload.dropzoneText');

  /**
   * Проверка файла на соответствие ограничениям
   */
  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      onUploadError?.(new Error(t('fileUpload.error.tooLarge')));
      return false;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = `.${file.name.split('.').pop()}`;
      if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes(file.type)) {
        onUploadError?.(new Error(t('fileUpload.error.unsupportedType')));
        return false;
      }
    }

    return true;
  };

  /**
   * Обработка выбранных файлов
   */
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileInfo[] = [];

    Array.from(fileList).forEach(file => {
      if (validateFile(file)) {
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        });

        // Имитация загрузки файла
        setStatus('uploading');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onProgress?.(progress, newFiles[newFiles.length - 1]);
          
          if (progress >= 100) {
            clearInterval(interval);
            setStatus('success');
            onUploadSuccess?.(newFiles[newFiles.length - 1]);
          }
        }, 500);
      }
    });

    setFiles(prev => (multiple ? [...prev, ...newFiles] : newFiles));
  }, [multiple, maxSize, accept, onUploadSuccess, onUploadError, onProgress]);

  /**
   * Обработчики drag&drop
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  /**
   * Удаление файла
   */
  const handleDelete = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setStatus('idle');
    }
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Зона для перетаскивания */}
      <UploadBox
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={dragActive ? 'dragActive' : ''}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon 
          sx={{ 
            fontSize: 48, 
            color: themeColors.primary, 
            mb: tokens.spacing.sm,
            transition: tokens.transitions.duration.normal,
          }} 
        />
        <Typography 
          variant="body1"
          sx={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.medium,
            color: themeColors.textPrimary,
            mb: tokens.spacing.xs,
          }}
        >
          {effectiveDropzoneText}
        </Typography>
        {accept && (
          <Typography 
            variant="caption" 
            sx={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.fontSize.sm,
              color: themeColors.textSecondary,
            }}
          >
            {t('fileUpload.supportedFormats', { formats: accept })}
          </Typography>
        )}
      </UploadBox>

      {/* Список файлов */}
      {files.map((file, index) => (
        <FileItem
          key={`${file.name}-${index}`}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="subtitle2" 
              noWrap
              sx={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
                color: themeColors.textPrimary,
              }}
            >
              {file.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.fontSize.sm,
                color: themeColors.textSecondary,
              }}
            >
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
            {status === 'uploading' && (
              <StyledLinearProgress
                variant="determinate"
                value={file.progress}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => handleDelete(index)}
            sx={{ 
              color: themeColors.error,
              transition: tokens.transitions.duration.fast,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? `${themeColors.errorDark}20` 
                  : `${themeColors.errorLight}40`,
              },
            }}
          >
            {t('fileUpload.delete')}
          </IconButton>
        </FileItem>
      ))}
    </Box>
  );
};

export default FileUpload; 