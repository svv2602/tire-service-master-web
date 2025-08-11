import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Drawer,
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
  Collapse,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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
  tireRecommendations?: TireRecommendation[];
  showCarSearchButton?: boolean;
  carSearchQuery?: string;
  catalogButton?: CatalogButton;
}

interface CatalogButton {
  text: string;
  filters: {
    width: number;
    height: number;
    diameter: string;
    season: string;
  };
  action: string;
}

interface TireRecommendation {
  product: {
    id: number;
    brand_normalized: string;
    original_brand: string;
    original_model: string;
    name: string;
    width: number;
    height: number;
    diameter: string;
    season: string;
    price_uah: string;
    description: string;
  };
  optimality_score: number;
}

interface TireChatSidebarProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
  onTireRecommendationClick?: (tireData: any) => void;
  onApplyCatalogFilters?: (filters: any) => void;
}

const TireChatSidebar: React.FC<TireChatSidebarProps> = ({
  open,
  onClose,
  initialMessage,
  onTireRecommendationClick,
  onApplyCatalogFilters
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Функция для получения локализованного названия сезона
  const getSeasonLabel = (season: string): string => {
    const seasonKey = `forms.clientPages.tireOffers.seasons.${season}`;
    const translated = t(seasonKey);
    // Если перевод не найден, используем fallback
    if (translated === seasonKey) {
      switch (season) {
        case 'winter': return 'Зимние';
        case 'summer': return 'Летние';
        case 'all_season': return 'Всесезонные';
        default: return season;
      }
    }
    return translated;
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  // Быстрые вопросы в зависимости от языка
  const quickQuestions = [
    t('tireChat.quickQuestions.winterTires', 'Зимние шины'),
    t('tireChat.quickQuestions.summerTires', 'Летние шины'),
    t('tireChat.quickQuestions.allSeasonTires', 'Всесезонные шины'),
    t('tireChat.quickQuestions.cheapTires', 'Недорогие шины'),
    t('tireChat.quickQuestions.premiumTires', 'Премиум шины'),
    t('tireChat.quickQuestions.sizeRecommendation', 'Какой размер выбрать?'),
    t('tireChat.quickQuestions.brandComparison', 'Сравнить бренды'),
    t('tireChat.quickQuestions.fuelEfficiency', 'Экономичные шины')
  ];

  // Скроллим к концу при добавлении новых сообщений
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Фокус на поле ввода
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Небольшая задержка для корректной работы
  }, []);

  // Обработчик клика по кнопке каталога
  const handleCatalogButtonClick = (catalogButton: CatalogButton) => {
    if (onApplyCatalogFilters) {
      onApplyCatalogFilters(catalogButton.filters);
    }
    // Закрываем чат после применения фильтров
    onClose();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Скролл к концу при открытии чата
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollToBottom();
      }, 200); // Небольшая задержка для корректного отображения
    }
  }, [open, scrollToBottom]);

  // Инициализация чата при открытии
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: t('tireChat.welcome'),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      if (initialMessage) {
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 1000);
      } else {
        // Фокусируем поле ввода при открытии чата
        focusInput();
      }
    }
  }, [open, initialMessage, t, focusInput]);

  // Обработка клика на рекомендацию шины
  const handleTireRecommendationClick = (tire: TireRecommendation) => {
    // Передаем полный объект рекомендации для применения фильтров
    onTireRecommendationClick?.(tire);
    // Закрываем чат после применения фильтров
    onClose();
  };

  // Обработка клика на кнопку поиска по автомобилю
  const handleCarSearchClick = (carQuery: string) => {
    // Закрываем чат и переходим на страницу поиска по автомобилю
    onClose();
    // Используем window.location для перехода с передачей поискового запроса
    const searchParams = new URLSearchParams();
    if (carQuery) {
      searchParams.set('q', carQuery);
    }
    window.location.href = `/client/tire-search?${searchParams.toString()}`;
  };

  // Отправка сообщения
  const handleSendMessage = async (messageText?: string, isQuickQuestion?: boolean) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Скрываем быстрые вопросы после первого сообщения
    if (showQuickQuestions) {
      setShowQuickQuestions(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

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
      const response = await fetch(`${config.API_URL}/api/v1/tire_chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
          locale: i18n.language,
          is_quick_question: isQuickQuestion || false
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => {
          const newMessages = prev.filter(msg => !msg.isLoading);
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response.message || t('tireChat.errorMessage'),
            timestamp: new Date(),
            tireRecommendations: data.response.recommendations || [],
            showCarSearchButton: data.response.action === 'show_car_search_button',
            carSearchQuery: data.response.car_search_query || '',
            catalogButton: data.response.catalog_button || undefined
          };
          return [...newMessages, assistantMessage];
        });
        
        setConversationId(data.conversation_id);
        
        // Фокусируем поле ввода после получения ответа
        focusInput();
      } else {
        throw new Error(data.error || 'Ошибка сервера');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      
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
      
      // Фокусируем поле ввода после ошибки
      focusInput();
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
    setShowQuickQuestions(true);
    
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

  // Обработка клика на быстрый вопрос
  const handleQuickQuestionClick = (question: string) => {
    // Сбрасываем разговор для нового поиска
    setMessages([]);
    setConversationId(null);
    setInputMessage('');
    
    // Добавляем приветственное сообщение
    const welcomeMessage: Message = {
      id: 'welcome-quick',
      role: 'assistant',
      content: t('tireChat.welcome'),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Отправляем быстрый вопрос с флагом сброса
    handleSendMessage(question, true); // true = quick question (reset filters)
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(30, 30, 30, 0.98)',
          borderLeft: `1px solid ${colors.borderPrimary}`
        }
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          p: 2,
          bgcolor: colors.primary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.borderPrimary}`
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
            title={t('tireChat.newChat')}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Быстрые вопросы */}
      <Collapse in={showQuickQuestions}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.borderPrimary}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flexGrow: 1, fontWeight: 500 }}>
              {t('tireChat.quickQuestions.title', 'Быстрые вопросы:')}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowQuickQuestions(false)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ExpandLessIcon />
            </IconButton>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {quickQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => handleQuickQuestionClick(question)}
                size="small"
                sx={{
                  bgcolor: 'rgba(70, 70, 70, 0.8)',
                  color: '#ffffff',
                  border: `1px solid rgba(255, 255, 255, 0.3)`,
                  '&:hover': {
                    bgcolor: colors.primary,
                    color: 'white',
                    borderColor: colors.primary
                  },
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 400
                }}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>

      {/* Область сообщений */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
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
                    width: 28,
                    height: 28
                  }}
                >
                  <BotIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}

              <Box sx={{ maxWidth: '75%' }}>
                <Paper
                  elevation={message.role === 'user' ? 0 : 1}
                  sx={{
                    p: 1.5,
                    bgcolor: message.role === 'user' 
                      ? 'transparent'
                      : 'rgba(50, 50, 50, 0.95)',
                    border: message.role === 'user' 
                      ? 'none'
                      : 'none',
                    borderRadius: 2,
                    mb: 0.5
                  }}
                >
                  {message.isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={14} sx={{ color: '#ffffff' }} />
                      <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 400 }}>
                        {t('tireChat.loading')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap', 
                      color: message.role === 'user' ? '#ffffff' : '#ffffff', 
                      fontSize: '0.85rem',
                      fontWeight: message.role === 'user' ? 500 : 400,
                      lineHeight: 1.4,
                      textShadow: message.role === 'user' ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                    }}>
                      {message.content}
                    </Typography>
                  )}
                </Paper>

                {/* Рекомендации шин */}
                {message.tireRecommendations && message.tireRecommendations.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 1, fontWeight: 500 }}>
                      {t('tireChat.recommendations', 'Рекомендации:')}
                    </Typography>
                    <Stack spacing={1}>
                      {message.tireRecommendations.map((tire) => (
                        <Paper
                          key={tire.product.id}
                          elevation={1}
                          onClick={() => handleTireRecommendationClick(tire)}
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(70, 70, 70, 0.9)',
                            border: `1px solid rgba(255, 255, 255, 0.2)`,
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(76, 175, 80, 0.2)',
                              borderColor: '#4CAF50',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {tire.product.brand_normalized || tire.product.original_brand} {tire.product.original_model}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                            {tire.product.width}/{tire.product.height}R{tire.product.diameter} • {getSeasonLabel(tire.product.season)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600, mt: 0.5 }}>
                            {tire.product.price_uah} грн
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Кнопка поиска по автомобилю */}
                {message.showCarSearchButton && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleCarSearchClick(message.carSearchQuery || '')}
                      sx={{
                        bgcolor: '#4CAF50',
                        color: '#ffffff',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#45a049'
                        }
                      }}
                    >
                      🔍 Поиск шин по автомобилю
                    </Button>
                  </Box>
                )}

                {/* Кнопка каталога */}
                {message.catalogButton && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleCatalogButtonClick(message.catalogButton!)}
                      sx={{
                        color: '#4CAF50',
                        borderColor: '#4CAF50',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          borderColor: '#45a049'
                        }
                      }}
                    >
                      {message.catalogButton.text}
                    </Button>
                  </Box>
                )}

                {/* Время сообщения */}
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.6rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'block',
                    textAlign: message.role === 'user' ? 'right' : 'left'
                  }}
                >
                  {message.timestamp.toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>

              {message.role === 'user' && (
                <Avatar
                  sx={{
                    bgcolor: colors.warning,
                    width: 28,
                    height: 28
                  }}
                >
                  <PersonIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Кнопка для показа быстрых вопросов */}
      {!showQuickQuestions && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Button
            size="small"
            startIcon={<ExpandMoreIcon />}
            onClick={() => setShowQuickQuestions(true)}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': {
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {t('tireChat.showQuickQuestions', 'Показать быстрые вопросы')}
          </Button>
        </Box>
      )}

      {/* Поле ввода */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(40, 40, 40, 0.95)',
          borderTop: `1px solid ${colors.borderPrimary}`
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('tireChat.placeholder')}
            variant="outlined"
            size="small"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'rgba(70, 70, 70, 0.9)',
                color: '#fff',
                fontSize: '0.85rem',
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem'
                },
                '& textarea::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary
                }
              },
              '& .MuiInputBase-input': {
                color: '#fff'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              borderRadius: 2,
              height: 'fit-content'
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TireChatSidebar;