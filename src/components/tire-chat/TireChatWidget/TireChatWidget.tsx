import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  CircularProgress,
  Fade,
  Alert
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getThemeColors } from '../../../styles';
import config from '../../../config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface TireChatWidgetProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const TireChatWidget: React.FC<TireChatWidgetProps> = ({
  open,
  onClose,
  initialMessage
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Скроллим к концу при добавлении новых сообщений
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Фокус на поле ввода (используется только при клике пользователя)
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Небольшая задержка для корректной работы
  };

  // Фокус на последний ответ системы
  const focusLastAssistantMessage = () => {
    setTimeout(() => {
      lastAssistantMessageRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      lastAssistantMessageRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Инициализация чата при открытии
  useEffect(() => {
    if (open && messages.length === 0) {
      // Добавляем приветственное сообщение
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: t('tireChat.welcome'),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      // Если есть начальное сообщение, отправляем его
      if (initialMessage) {
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 1000);
      } else {
        // Фокусируем поле ввода при открытии чата
        focusInput();
      }
    }
  }, [open, initialMessage]);

  // Сброс чата при закрытии
  const handleClose = () => {
    setMessages([]);
    setInputMessage('');
    setConversationId(null);
    onClose();
  };

  // Отправка сообщения
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    // Добавляем индикатор загрузки для ответа бота
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Отправляем запрос к API
      const response = await fetch(`${config.API_URL}/api/v1/tire_chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
          locale: i18n.language // Передаем текущую локаль
        })
      });

      const data = await response.json();

      if (data.success) {
        // Удаляем индикатор загрузки и добавляем ответ
        setMessages(prev => {
          const newMessages = prev.filter(msg => !msg.isLoading);
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response.message || 'Извините, произошла ошибка. Попробуйте еще раз.',
            timestamp: new Date()
          };
          return [...newMessages, assistantMessage];
        });
        
        setConversationId(data.conversation_id);
        
        // Фокусируем последний ответ системы вместо поля ввода
        focusLastAssistantMessage();
      } else {
        throw new Error(data.error || 'Ошибка сервера');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      
      // Удаляем индикатор загрузки и показываем ошибку
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isLoading);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t('tireChat.errorMessage'),
          timestamp: new Date()
        };
        return [...newMessages, errorMessage];
      });
      
      // Фокусируем последний ответ системы (ошибку) вместо поля ввода
      focusLastAssistantMessage();
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Новый разговор
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage('');
    
    // Добавляем приветственное сообщение
    const welcomeMessage: Message = {
      id: 'welcome-new',
      role: 'assistant',
      content: t('tireChat.newChatWelcome'),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Фокусируем поле ввода после начала нового разговора
    focusInput();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '700px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Заголовок */}
      <DialogTitle
        sx={{
          bgcolor: colors.primary,
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {t('tireChat.title')}
          </Typography>
        </Box>
        <Box>
          <IconButton
            size="small"
            onClick={handleNewConversation}
            sx={{ color: 'white', mr: 1 }}
            title="Новый разговор"
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Область сообщений */}
      <DialogContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          bgcolor: 'rgba(30, 30, 30, 0.95)' // Темный фон для лучшего контраста
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((message, index) => {
            // Определяем, является ли это последним сообщением системы
            const isLastAssistantMessage = message.role === 'assistant' && 
              index === messages.length - 1;
            
            return (
              <Fade key={message.id} in timeout={300}>
                <Box
                  ref={isLastAssistantMessage ? lastAssistantMessageRef : undefined}
                  tabIndex={isLastAssistantMessage ? 0 : undefined}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: 1,
                    outline: 'none' // Убираем видимый outline при фокусе
                  }}
                >
                {message.role === 'assistant' && (
                  <Avatar
                    sx={{
                      bgcolor: colors.primary,
                      width: 32,
                      height: 32
                    }}
                  >
                    <BotIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}

                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' 
                      ? colors.primary 
                      : 'rgba(60, 60, 60, 0.9)', // Темно-серый фон для бота
                    color: 'white', // Белый текст для всех сообщений
                    borderRadius: 2,
                    position: 'relative',
                    border: message.role === 'assistant' 
                      ? `1px solid ${colors.borderPrimary}` 
                      : 'none'
                  }}
                >
                  {message.isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {t('tireChat.loading')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'white' }}>
                      {message.content}
                    </Typography>
                  )}
                  
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      fontSize: '0.65rem',
                      mt: 0.5,
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.8)' // Полупрозрачный белый для времени
                    }}
                  >
                    {message.timestamp.toLocaleTimeString('ru', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Paper>

                {message.role === 'user' && (
                  <Avatar
                    sx={{
                      bgcolor: colors.warning,
                      width: 32,
                      height: 32
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                </Box>
              </Fade>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      {/* Поле ввода */}
      <DialogActions
        sx={{
          p: 2,
          bgcolor: 'rgba(40, 40, 40, 0.95)', // Темно-серый фон для поля ввода
          borderTop: `1px solid ${colors.borderPrimary}`
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onClick={focusInput} // Фокусируем поле ввода только при клике пользователя
            placeholder={t('tireChat.placeholder')}
            variant="outlined"
            size="small"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'rgba(70, 70, 70, 0.9)', // Темно-серый фон для поля ввода
                color: '#fff', // Белый текст
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)' // Светлый placeholder
                },
                '& textarea::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)' // Светлый placeholder для textarea
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)' // Светлая рамка
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)' // Ярче при наведении
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary // Основной цвет при фокусе
                }
              },
              '& .MuiInputBase-input': {
                color: '#fff' // Белый текст в поле ввода
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              minWidth: 'auto',
              px: 2,
              borderRadius: 2
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TireChatWidget;