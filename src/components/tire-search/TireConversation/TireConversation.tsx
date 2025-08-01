import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Fade,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  AutoAwesome as AutoAwesomeIcon
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
          background: `linear-gradient(135deg, ${colors.backgroundPaper} 0%, ${colors.backgroundDefault} 100%)`,
          border: `1px solid ${colors.primary}20`,
          borderRadius: 2
        }}
      >
        {/* Заголовок чата */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ChatIcon sx={{ color: colors.primary, mr: 1 }} />
          <Typography variant="h6" sx={{ color: colors.textPrimary }}>
            Помощник по подбору шин
          </Typography>
          <AutoAwesomeIcon sx={{ color: colors.secondary, ml: 1, fontSize: 20 }} />
        </Box>

        {/* Сообщение системы */}
        {searchResponse.message && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: colors.primary + '10',
              borderRadius: 1,
              borderLeft: `4px solid ${colors.primary}`
            }}
          >
            <Typography variant="body1" sx={{ color: colors.textPrimary }}>
              {searchResponse.message}
            </Typography>
          </Box>
        )}

        {/* Предложения */}
        {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textSecondary }}>
              Выберите подходящий вариант:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchResponse.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    backgroundColor: colors.backgroundPaper,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.primary}30`,
                    '&:hover': {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary
                    },
                    cursor: 'pointer',
                    mb: 1
                  }}
                />
              ))}
            </Stack>
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