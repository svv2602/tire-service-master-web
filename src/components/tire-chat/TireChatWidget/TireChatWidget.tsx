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
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Скроллим к концу при добавлении новых сообщений
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        content: 'Привет! 👋 Я ваш персональный консультант по шинам. Расскажите, какие шины вы ищете, и я помогу подобрать лучший вариант.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      // Если есть начальное сообщение, отправляем его
      if (initialMessage) {
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 1000);
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
          conversation_id: conversationId
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
          content: 'Извините, консультант временно недоступен. Попробуйте использовать стандартные фильтры поиска.',
          timestamp: new Date()
        };
        return [...newMessages, errorMessage];
      });
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
      content: 'Начинаем новый разговор! Чем могу помочь с выбором шин?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
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
            Онлайн-консультант по шинам
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
          bgcolor: colors.backgroundSecondary
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
          {messages.map((message) => (
            <Fade key={message.id} in timeout={300}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1
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
                    bgcolor: message.role === 'user' ? colors.primary : colors.backgroundCard,
                    color: message.role === 'user' ? 'white' : colors.textPrimary,
                    borderRadius: 2,
                    position: 'relative'
                  }}
                >
                  {message.isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">
                        Думаю...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  )}
                  
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.65rem',
                      mt: 0.5,
                      display: 'block'
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
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      {/* Поле ввода */}
      <DialogActions
        sx={{
          p: 2,
          bgcolor: colors.backgroundCard,
          borderTop: `1px solid ${colors.borderPrimary}`
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите ваш вопрос о шинах..."
            variant="outlined"
            size="small"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
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