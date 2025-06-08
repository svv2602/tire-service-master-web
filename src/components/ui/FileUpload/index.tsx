import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import type { FileUploadProps } from './types';

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>((props, ref) => {
  const {
    onFilesSelected,
    accept,
    maxFiles = 1,
    multiple = false,
    label = 'Перетащите файлы сюда или нажмите для выбора',
    maxSize,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      if (maxSize && file.size > maxSize) {
        console.warn(`Файл "${file.name}" превышает максимальный размер`);
        return false;
      }
      return true;
    });

    if (validFiles.length > maxFiles) {
      console.warn(`Максимальное количество файлов: ${maxFiles}`);
      validFiles.splice(maxFiles);
    }

    onFilesSelected(validFiles);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <UploadBox
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      sx={{ backgroundColor: dragActive ? 'action.hover' : 'transparent' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
      <Typography>{label}</Typography>
      {maxSize && (
        <Typography variant="caption" color="text.secondary">
          Максимальный размер файла: {(maxSize / (1024 * 1024)).toFixed(1)} МБ
        </Typography>
      )}
    </UploadBox>
  );
});

FileUpload.displayName = 'FileUpload';

export type { FileUploadProps };
export default FileUpload;