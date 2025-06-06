import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  error?: boolean;
  disabled?: boolean;
}

// Стилизованный контейнер для редактора
const StyledEditorContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'editorHeight'
})<{ error?: boolean; editorHeight?: number }>(({ theme, error, editorHeight = 300 }) => ({
  '& .ql-container': {
    minHeight: `${editorHeight - 84}px`, // Вычитаем высоту тулбара
    fontSize: '16px',
    fontFamily: theme.typography.body1.fontFamily,
    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
    borderTop: 'none',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  '& .ql-toolbar': {
    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottom: 'none',
    backgroundColor: theme.palette.background.paper,
  },
  '& .ql-editor': {
    padding: '16px',
    lineHeight: 1.6,
    '&.ql-blank::before': {
      color: theme.palette.text.secondary,
      fontStyle: 'normal',
    },
    '& h1': {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '16px',
      color: theme.palette.text.primary,
    },
    '& h2': {
      fontSize: '1.75rem',
      fontWeight: 600,
      marginBottom: '14px',
      color: theme.palette.text.primary,
    },
    '& h3': {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '12px',
      color: theme.palette.text.primary,
    },
    '& p': {
      marginBottom: '12px',
      color: theme.palette.text.primary,
    },
    '& ul, & ol': {
      marginBottom: '12px',
      paddingLeft: '24px',
    },
    '& li': {
      marginBottom: '4px',
      color: theme.palette.text.primary,
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.default,
      padding: '12px 16px',
      margin: '16px 0',
      fontStyle: 'italic',
    },
    '& code': {
      backgroundColor: theme.palette.background.default,
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.875rem',
    },
    '& pre': {
      backgroundColor: theme.palette.background.default,
      padding: '16px',
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
      marginBottom: '16px',
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme.shape.borderRadius,
      marginBottom: '16px',
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '16px',
      '& th, & td': {
        border: `1px solid ${theme.palette.divider}`,
        padding: '8px 12px',
        textAlign: 'left',
      },
      '& th': {
        backgroundColor: theme.palette.background.default,
        fontWeight: 600,
      },
    },
  },
  '& .ql-snow .ql-tooltip': {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
  },
}));

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Начните писать...',
  height = 400,
  error = false,
  disabled = false,
}) => {
  const theme = useTheme();

  // Конфигурация модулей Quill
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      // Разрешить только обычную вставку текста
      matchVisual: false,
    },
  }), []);

  // Форматы, которые поддерживает редактор
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <StyledEditorContainer error={error} editorHeight={height}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        style={{
          height: height,
        }}
      />
    </StyledEditorContainer>
  );
};

export default RichTextEditor; 