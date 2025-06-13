import React, { useMemo, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
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
  onInsert: (url: string, alt: string, title: string, width: string, height: string, alignment: string, float: string) => void;
}

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

interface VideoDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, title: string, width: string, height: string, alignment: string) => void;
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
    padding: '12px 8px',
    '& button': {
      height: '32px',
      width: '32px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        '&::after': {
          content: 'attr(aria-label)',
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
        }
      },
    },
    '& .ql-picker': {
      height: '32px',
    },
    '& .ql-formats': {
      marginRight: '12px',
    },
    '& .ql-stroke': {
      stroke: theme.palette.text.primary,
      strokeWidth: '1.5px',
    },
    '& .ql-fill': {
      fill: theme.palette.text.primary,
    },
    '& .ql-picker-label': {
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
    '& .ql-picker-options': {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[3],
      padding: '8px',
      borderRadius: theme.shape.borderRadius,
    },
    '& .ql-active': {
      backgroundColor: `${theme.palette.action.selected} !important`,
      '& .ql-stroke': {
        stroke: theme.palette.primary.main,
      },
      '& .ql-fill': {
        fill: theme.palette.primary.main,
      },
    },
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
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [alignment, setAlignment] = useState('');
  const [float, setFloat] = useState('');

  const handleInsert = () => {
    if (url) {
      onInsert(url, alt, title, width, height, alignment, float);
      setUrl('');
      setAlt('');
      setTitle('');
      setWidth('');
      setHeight('');
      setAlignment('');
      setFloat('');
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
              label="Альтернативный текст (alt)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Описание изображения для SEO и доступности"
              helperText="Важно для SEO и доступности"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Заголовок (title)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок при наведении"
              helperText="Отображается при наведении на изображение"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ширина (px или %)"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="например: 500px или 100%"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Высота (px или auto)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="например: 300px или auto"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Выравнивание</InputLabel>
              <Select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                label="Выравнивание"
              >
                <MenuItem value="">Нет</MenuItem>
                <MenuItem value="left">По левому краю</MenuItem>
                <MenuItem value="center">По центру</MenuItem>
                <MenuItem value="right">По правому краю</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Обтекание</InputLabel>
              <Select
                value={float}
                onChange={(e) => setFloat(e.target.value)}
                label="Обтекание"
              >
                <MenuItem value="">Нет</MenuItem>
                <MenuItem value="left">Слева</MenuItem>
                <MenuItem value="right">Справа</MenuItem>
              </Select>
            </FormControl>
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
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('640');
  const [height, setHeight] = useState('360');
  const [alignment, setAlignment] = useState('');

  const handleInsert = () => {
    if (url) {
      onInsert(url, title, width, height, alignment);
      setUrl('');
      setTitle('');
      setWidth('640');
      setHeight('360');
      setAlignment('');
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Заголовок (title)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок видео для SEO"
              helperText="Важно для SEO и доступности"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ширина (px или %)"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="например: 640"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Высота (px)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="например: 360"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Выравнивание</InputLabel>
              <Select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                label="Выравнивание"
              >
                <MenuItem value="">Нет</MenuItem>
                <MenuItem value="left">По левому краю</MenuItem>
                <MenuItem value="center">По центру</MenuItem>
                <MenuItem value="right">По правому краю</MenuItem>
              </Select>
            </FormControl>
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
  
  // Состояние для переключения между режимами редактирования
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  // Quill Reference
  const quillRef = useRef<ReactQuill>(null);

  // Обработчики для расширенных функций
  const handleImageInsert = (
    url: string, 
    alt: string, 
    title: string, 
    width: string, 
    height: string, 
    alignment: string, 
    float: string
  ) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      
      // Создаем стили для изображения
      let imageStyles = '';
      if (width) imageStyles += `width: ${width};`;
      if (height) imageStyles += `height: ${height};`;
      
      // Добавляем выравнивание
      if (alignment) {
        if (alignment === 'center') {
          imageStyles += `display: block; margin-left: auto; margin-right: auto;`;
        } else {
          imageStyles += `text-align: ${alignment};`;
        }
      }
      
      // Добавляем обтекание
      if (float) {
        imageStyles += `float: ${float}; margin: ${float === 'left' ? '0 10px 10px 0' : '0 0 10px 10px'};`;
      }
      
      // Создаем HTML для изображения с атрибутами
      const imageHtml = `<img src="${url}" alt="${alt}" title="${title}" style="${imageStyles}" />`;
      
      // Вставляем HTML через clipboard API
      editor.clipboard.dangerouslyPasteHTML(range.index, imageHtml);
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

  const handleVideoInsert = (
    url: string, 
    title: string, 
    width: string, 
    height: string, 
    alignment: string
  ) => {
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
      
      // Создаем стили для контейнера видео
      let containerStyles = '';
      if (alignment === 'center') {
        containerStyles = `display: flex; justify-content: center; margin: 10px 0;`;
      } else if (alignment === 'left') {
        containerStyles = `display: flex; justify-content: flex-start; margin: 10px 0;`;
      } else if (alignment === 'right') {
        containerStyles = `display: flex; justify-content: flex-end; margin: 10px 0;`;
      }
      
      // Создаем HTML для видео с атрибутами
      const videoHtml = `<div style="${containerStyles}"><iframe src="${videoUrl}" title="${title}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe></div>`;
      
      // Вставляем HTML через clipboard API
      editor.clipboard.dangerouslyPasteHTML(range.index, videoHtml);
      editor.setSelection(range.index + 1, 0);
    }
  };

  // Функция для добавления подписей к кнопкам
  const addButtonLabels = () => {
    setTimeout(() => {
      // Добавляем подписи к кнопкам форматирования
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        // Форматирование текста
        const boldButton = toolbar.querySelector('.ql-bold');
        if (boldButton) boldButton.setAttribute('aria-label', 'Жирный');
        
        const italicButton = toolbar.querySelector('.ql-italic');
        if (italicButton) italicButton.setAttribute('aria-label', 'Курсив');
        
        const underlineButton = toolbar.querySelector('.ql-underline');
        if (underlineButton) underlineButton.setAttribute('aria-label', 'Подчеркнутый');
        
        const strikeButton = toolbar.querySelector('.ql-strike');
        if (strikeButton) strikeButton.setAttribute('aria-label', 'Зачеркнутый');
        
        // Списки
        const orderedListButton = toolbar.querySelector('.ql-list[value="ordered"]');
        if (orderedListButton) orderedListButton.setAttribute('aria-label', 'Нумерованный список');
        
        const bulletListButton = toolbar.querySelector('.ql-list[value="bullet"]');
        if (bulletListButton) bulletListButton.setAttribute('aria-label', 'Маркированный список');
        
        // Отступы
        const indentMinusButton = toolbar.querySelector('.ql-indent[value="-1"]');
        if (indentMinusButton) indentMinusButton.setAttribute('aria-label', 'Уменьшить отступ');
        
        const indentPlusButton = toolbar.querySelector('.ql-indent[value="+1"]');
        if (indentPlusButton) indentPlusButton.setAttribute('aria-label', 'Увеличить отступ');
        
        // Выравнивание
        const alignButtons = toolbar.querySelectorAll('.ql-align');
        alignButtons.forEach((button) => {
          const value = button.getAttribute('value') || 'left';
          let label = 'По левому краю';
          if (value === 'center') label = 'По центру';
          if (value === 'right') label = 'По правому краю';
          if (value === 'justify') label = 'По ширине';
          button.setAttribute('aria-label', label);
        });
        
        // Специальные блоки
        const blockquoteButton = toolbar.querySelector('.ql-blockquote');
        if (blockquoteButton) blockquoteButton.setAttribute('aria-label', 'Цитата');
        
        const codeBlockButton = toolbar.querySelector('.ql-code-block');
        if (codeBlockButton) codeBlockButton.setAttribute('aria-label', 'Блок кода');
        
        // Медиа
        const linkButton = toolbar.querySelector('.ql-link');
        if (linkButton) linkButton.setAttribute('aria-label', 'Вставить ссылку');
        
        const imageButton = toolbar.querySelector('.ql-image');
        if (imageButton) imageButton.setAttribute('aria-label', 'Вставить изображение');
        
        const videoButton = toolbar.querySelector('.ql-video');
        if (videoButton) videoButton.setAttribute('aria-label', 'Вставить видео');
        
        const tableButton = toolbar.querySelector('.ql-table');
        if (tableButton) tableButton.setAttribute('aria-label', 'Вставить таблицу');
        
        // Очистка форматирования
        const cleanButton = toolbar.querySelector('.ql-clean');
        if (cleanButton) cleanButton.setAttribute('aria-label', 'Очистить форматирование');
      }
    }, 100);
  };

  // Добавляем эффект для установки подписей после монтирования
  React.useEffect(() => {
    addButtonLabels();
  }, []);

  // Кастомные обработчики для тулбара
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

  // Обработчик переключения между режимами редактирования
  const handleModeToggle = () => {
    if (isHtmlMode) {
      // Переключаемся с HTML на визуальный режим
      onChange(htmlContent);
    } else {
      // Переключаемся с визуального режима на HTML
      // Форматируем HTML для лучшей читаемости
      const formattedHtml = formatHtml(value);
      setHtmlContent(formattedHtml);
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Функция для форматирования HTML
  const formatHtml = (html: string): string => {
    // Простое форматирование HTML с отступами
    let formatted = '';
    let indent = 0;
    
    // Замена всех тегов на теги с новой строкой
    const tags = html.replace(/>\s*</g, '>\n<').split('\n');
    
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i].trim();
      
      // Проверяем, является ли тег закрывающим
      const isClosingTag = tag.indexOf('</') === 0;
      // Проверяем, является ли тег самозакрывающимся
      const isSelfClosingTag = tag.indexOf('/>') >= 0;
      
      // Уменьшаем отступ для закрывающих тегов
      if (isClosingTag) {
        indent--;
      }
      
      // Добавляем отформатированную строку
      formatted += '  '.repeat(Math.max(0, indent)) + tag + '\n';
      
      // Увеличиваем отступ для открывающих тегов, если они не самозакрывающиеся и не закрывающие
      if (!isClosingTag && !isSelfClosingTag && tag.indexOf('<') === 0) {
        indent++;
      }
    }
    
    return formatted;
  };

  return (
    <>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {isHtmlMode && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Форматировать HTML
                  setHtmlContent(formatHtml(htmlContent));
                }}
                sx={{ textTransform: 'none', mr: 1 }}
              >
                Форматировать
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Проверка орфографии
                  window.alert('Функция проверки орфографии будет добавлена в следующей версии');
                }}
                sx={{ textTransform: 'none', mr: 1 }}
              >
                Проверка орфографии
              </Button>
            </>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleModeToggle}
          sx={{ textTransform: 'none' }}
        >
          {isHtmlMode ? 'Визуальный редактор' : 'HTML редактор'}
        </Button>
      </Box>
      
      <StyledEditorContainer error={error} editorHeight={height}>
        {isHtmlMode ? (
          <TextField
            multiline
            fullWidth
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Введите HTML код..."
            sx={{ 
              height: height,
              '& .MuiInputBase-root': {
                height: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
              },
              '& .MuiInputBase-input': {
                height: '100%',
                overflow: 'auto',
                padding: '16px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                alignItems: 'flex-start',
                verticalAlign: 'top',
              }
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0,
                  padding: '8px 16px',
                  borderBottom: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    HTML-редактор
                  </Typography>
                  <Box>
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={() => {
                        // Открыть предпросмотр в новом окне
                        const previewWindow = window.open('', '_blank');
                        if (previewWindow) {
                          previewWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Предпросмотр</title>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                  body { 
                                    font-family: Arial, sans-serif; 
                                    line-height: 1.6;
                                    max-width: 800px;
                                    margin: 0 auto;
                                    padding: 20px;
                                  }
                                  img { max-width: 100%; height: auto; }
                                  table { border-collapse: collapse; width: 100%; }
                                  th, td { border: 1px solid #ddd; padding: 8px; }
                                  th { background-color: #f2f2f2; }
                                </style>
                              </head>
                              <body>
                                ${htmlContent}
                              </body>
                            </html>
                          `);
                          previewWindow.document.close();
                        }
                      }}
                    >
                      Предпросмотр
                    </Button>
                  </Box>
                </Box>
              ),
            }}
          />
        ) : (
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
        )}
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