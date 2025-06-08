import React, { useCallback, useState, useRef } from 'react';
import { Box, Typography, LinearProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileUploadProps, FileInfo, FileUploadStatus } from './types';

/**
 * Компонент FileUpload - для загрузки файлов с поддержкой drag&drop
 */
const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  multiple = false,
  dropzoneText = 'Перетащите файлы сюда или нажмите для выбора',
  onUploadSuccess,
  onUploadError,
  onProgress,
  sx,
}) => {
  const [status, setStatus] = useState<FileUploadStatus>('idle');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Проверка файла на соответствие ограничениям
   */
  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      onUploadError?.(new Error(`Файл слишком большой. Максимальный размер: ${maxSize} байт`));
      return false;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = `.${file.name.split('.').pop()}`;
      if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes(file.type)) {
        onUploadError?.(new Error('Неподдерживаемый тип файла'));
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
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1">{dropzoneText}</Typography>
        {accept && (
          <Typography variant="caption" color="text.secondary">
            Поддерживаемые форматы: {accept}
          </Typography>
        )}
      </Box>

      {/* Список файлов */}
      {files.map((file, index) => (
        <Box
          key={`${file.name}-${index}`}
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
            {status === 'uploading' && (
              <LinearProgress
                variant="determinate"
                value={file.progress}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => handleDelete(index)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default FileUpload; 