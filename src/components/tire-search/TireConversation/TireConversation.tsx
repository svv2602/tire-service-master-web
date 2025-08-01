import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Fade,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import type { 
  FollowUpQuestion, 
  TireSearchResponse,
  ConversationMessage 
} from '../../../types/tireSearch';
import { getThemeColors } from '../../../styles';

interface TireConversationProps {
  searchResponse: TireSearchResponse;
  onSuggestionClick: (suggestion: string) => void;
  onQuestionAnswer: (field: string, value: string) => void;
  onNewSearch: (query: string) => void;
}

const TireConversation: React.FC<TireConversationProps> = ({
  searchResponse,
  onSuggestionClick,
  onQuestionAnswer,
  onNewSearch
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [userInput, setUserInput] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);

  if (!searchResponse.conversation_mode) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
  };

  const handleQuestionAnswer = (question: FollowUpQuestion, value: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [question.field]: value
    }));
    onQuestionAnswer(question.field, value);
  };

  const handleUserInput = () => {
    if (userInput.trim()) {
      onNewSearch(userInput.trim());
      setUserInput('');
      setIsInputMode(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleUserInput();
    }
  };

  const handleStartNewChat = () => {
    setSelectedAnswers({});
    setUserInput('');
    setIsInputMode(false);
    // Можно добавить callback для сброса всего состояния чата
    onNewSearch('');
  };

  const buildSearchQuery = () => {
    const parts: string[] = [];
    
    // Добавляем уже собранные данные
    if (searchResponse.query_info?.parsed_data?.brand) {
      parts.push(searchResponse.query_info.parsed_data.brand);
    }
    
    // Добавляем выбранные ответы
    Object.entries(selectedAnswers).forEach(([field, value]) => {
      if (field === 'model') {
        parts.push(value);
      } else if (field === 'seasonality') {
        const seasonMap: Record<string, string> = {
          'winter': 'зимние',
          'summer': 'летние',
          'all_season': 'всесезонные'
        };
        parts.push(seasonMap[value] || value);
      }
    });
    
    parts.push('шины');
    return parts.join(' ');
  };

  const canPerformSearch = () => {
    return Object.keys(selectedAnswers).length > 0 || 
           searchResponse.query_info?.parsed_data?.brand;
  };

  return (
    <Fade in={true}>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${colors.backgroundCard} 0%, ${colors.backgroundSecondary} 100%)`,
          border: `1px solid ${colors.primary}20`,
          borderRadius: 2
        }}
      >
        {/* Заголовок чата */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ color: colors.primary, mr: 1 }} />
            <Typography variant="h6" sx={{ color: colors.textPrimary }}>
              Помощник по подбору шин
            </Typography>
            <AutoAwesomeIcon sx={{ color: colors.warning, ml: 1, fontSize: 20 }} />
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleStartNewChat}
            sx={{
              color: colors.textSecondary,
              borderColor: colors.borderPrimary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.primary + '10'
              }
            }}
          >
            Новый чат
          </Button>
        </Box>

        {/* Отображение распознанных данных */}
        {searchResponse.query_info?.parsed_data && Object.keys(searchResponse.query_info.parsed_data).length > 0 && (
          <Alert 
            severity="info" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Уже распознано:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchResponse.query_info.parsed_data.brand && (
                <Chip 
                  label={`Марка: ${searchResponse.query_info.parsed_data.brand}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {searchResponse.query_info.parsed_data.model && (
                <Chip 
                  label={`Модель: ${searchResponse.query_info.parsed_data.model}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {searchResponse.query_info.parsed_data.year && (
                <Chip 
                  label={`Год: ${searchResponse.query_info.parsed_data.year}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {(searchResponse.query_info.parsed_data as any).seasonality && (
                <Chip 
                  label={`Сезон: ${(searchResponse.query_info.parsed_data as any).seasonality === 'winter' ? 'Зимние' : 
                    (searchResponse.query_info.parsed_data as any).seasonality === 'summer' ? 'Летние' : 'Всесезонные'}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Alert>
        )}

        {/* Сообщение системы */}
        {searchResponse.message && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: colors.primary + '10',
              borderRadius: 1,
              borderLeft: `4px solid ${colors.primary}`,
              position: 'relative'
            }}
          >
            <Typography variant="body1" sx={{ color: colors.textPrimary, mb: 1 }}>
              {searchResponse.message}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: colors.textSecondary,
              fontStyle: 'italic',
              display: 'block'
            }}>
              👆 Кликните по предложению ниже или введите свой вариант
            </Typography>
          </Box>
        )}

        {/* Предложения */}
        {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textSecondary }}>
              💡 Выберите подходящий вариант или кликните по любому предложению:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchResponse.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    backgroundColor: colors.backgroundCard,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.primary}30`,
                    '&:hover': {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 8px ${colors.primary}20`
                    },
                    cursor: 'pointer',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              ))}
            </Stack>
            
            {/* Кнопка для переключения в режим ввода */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setIsInputMode(!isInputMode)}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': {
                    backgroundColor: colors.primary + '10'
                  }
                }}
              >
                {isInputMode ? '↑ Скрыть поле ввода' : '✏️ Ввести свой вариант'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Поле ввода текста */}
        {isInputMode && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите марку и модель автомобиля (например: BMW X5 2020)"
              variant="outlined"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleUserInput}
                      disabled={!userInput.trim()}
                      sx={{
                        color: colors.primary,
                        '&:disabled': {
                          color: colors.textMuted
                        }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: colors.backgroundField,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.borderPrimary
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary
                  }
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: colors.textPrimary
                },
                '& .MuiInputBase-input::placeholder': {
                  color: colors.textMuted,
                  opacity: 1
                }
              }}
            />
          </Box>
        )}

        {/* Follow-up вопросы */}
        {searchResponse.follow_up_questions && searchResponse.follow_up_questions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {searchResponse.follow_up_questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textSecondary }}>
                  {question.question}
                </Typography>
                
                {question.options ? (
                  // Вопрос с вариантами ответов
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {question.options.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        onClick={() => handleQuestionAnswer(question, option.value)}
                        color={selectedAnswers[question.field] === option.value ? 'primary' : 'default'}
                        variant={selectedAnswers[question.field] === option.value ? 'filled' : 'outlined'}
                        sx={{
                          cursor: 'pointer',
                          mb: 1
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  // Открытый вопрос - показываем предложения из контекста
                  question.context?.brand && (
                    <Typography variant="body2" sx={{ 
                      color: colors.textSecondary,
                      fontStyle: 'italic' 
                    }}>
                      Выберите из предложений выше или введите свой вариант
                    </Typography>
                  )
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Кнопка для выполнения поиска */}
        {canPerformSearch() && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => onNewSearch(buildSearchQuery())}
              sx={{
                backgroundColor: colors.primary,
                color: colors.textPrimary,
                '&:hover': {
                  backgroundColor: colors.primaryDark
                }
              }}
            >
              Найти шины
            </Button>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default TireConversation;