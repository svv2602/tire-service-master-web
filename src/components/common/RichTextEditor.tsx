import React, { useMemo, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  error?: boolean;
  disabled?: boolean;
}

// Типы для модальных окон
interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

interface VideoDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
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

// Компоненты модальных окон для расширенных функций
const ImageDialog: React.FC<ImageDialogProps> = ({ open, onClose, onInsert }) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  const handleInsert = () => {
    if (url) {
      onInsert(url, alt);
      setUrl('');
      setAlt('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Вставить изображение</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL изображения"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Альтернативный текст"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Описание изображения"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleInsert} variant="contained" color="primary">
          Вставить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TableDialog: React.FC<TableDialogProps> = ({ open, onClose, onInsert }) => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  const handleInsert = () => {
    onInsert(rows, cols);
    setRows(2);
    setCols(2);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Вставить таблицу</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Строки"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Столбцы"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleInsert} variant="contained" color="primary">
          Вставить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VideoDialog: React.FC<VideoDialogProps> = ({ open, onClose, onInsert }) => {
  const [url, setUrl] = useState('');

  const handleInsert = () => {
    if (url) {
      onInsert(url);
      setUrl('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Вставить видео</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL видео"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
              helperText="Поддерживаются ссылки YouTube, Vimeo и другие"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleInsert} variant="contained" color="primary">
          Вставить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Начните писать...',
  height = 400,
  error = false,
  disabled = false,
}) => {
  const theme = useTheme();
  
  // Состояние для модальных окон
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  
  // Quill Reference
  const quillRef = useRef<ReactQuill>(null);

  // Обработчики для расширенных функций
  const handleImageInsert = (url: string, alt: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', url);
      // Добавляем атрибут alt, если поддерживается
      editor.formatText(range.index, 1, { alt: alt });
      editor.setSelection(range.index + 1, 0);
    }
  };

  const handleTableInsert = (rows: number, cols: number) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      
      // Создаем HTML для таблицы
      let tableHTML = '<table><tbody>';
      for (let r = 0; r < rows; r++) {
        tableHTML += '<tr>';
        for (let c = 0; c < cols; c++) {
          if (r === 0) {
            tableHTML += '<th></th>';
          } else {
            tableHTML += '<td></td>';
          }
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      
      // Вставляем HTML через clipboard API
      editor.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
      editor.setSelection(range.index + 1, 0);
    }
  };

  const handleVideoInsert = (url: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      
      // Преобразуем URL YouTube если нужно
      let videoUrl = url;
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1].split('?')[0];
        videoUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      
      editor.insertEmbed(range.index, 'video', videoUrl);
      editor.setSelection(range.index + 1, 0);
    }
  };

  // Конфигурация модулей Quill
  const modules = useMemo(() => {
    // Перемещаем customHandlers внутрь useMemo для избежания предупреждений линтера
    const handlers = {
      image: () => setImageDialogOpen(true),
      table: () => setTableDialogOpen(true),
      video: () => setVideoDialogOpen(true),
    };
    
    return {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video', 'table'],
          ['clean']
        ],
        handlers: handlers,
      },
      clipboard: {
        matchVisual: false,
      },
    };
  }, [setImageDialogOpen, setTableDialogOpen, setVideoDialogOpen]);

  // Форматы, которые поддерживает редактор
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'table', 'table-cell', 'table-row', 'table-header'
  ];

  return (
    <>
      <StyledEditorContainer error={error} editorHeight={height}>
        <ReactQuill
          ref={quillRef}
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
      
      {/* Модальные окна для расширенных функций */}
      <ImageDialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)} 
        onInsert={handleImageInsert} 
      />
      
      <TableDialog 
        open={tableDialogOpen} 
        onClose={() => setTableDialogOpen(false)} 
        onInsert={handleTableInsert} 
      />

      <VideoDialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onInsert={handleVideoInsert}
      />
    </>
  );
};

export default RichTextEditor; 