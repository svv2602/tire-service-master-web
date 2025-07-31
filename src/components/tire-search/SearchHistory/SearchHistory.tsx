import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Типы данных
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters?: {
    diameter?: number;
    brand?: string;
    year?: number;
  };
  isFavorite?: boolean;
  clickCount?: number;
}

interface SearchHistoryProps {
  onSearchSelect: (query: string, filters?: any) => void;
  maxItems?: number;
  showFavorites?: boolean;
  compact?: boolean;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSearchSelect,
  maxItems = 10,
  showFavorites = true,
  compact = false
}) => {
  const { t } = useTranslation(['client', 'common']);
  
  // Состояние компонента
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<SearchHistoryItem[]>([]);
  const [expanded, setExpanded] = useState(!compact);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Ключи для localStorage
  const HISTORY_STORAGE_KEY = 'tire_search_history';
  const FAVORITES_STORAGE_KEY = 'tire_search_favorites';

  // Загрузка истории из localStorage
  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории поиска:', error);
    }
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Ошибка загрузки избранных поисков:', error);
    }
  };

  // Сохранение в localStorage
  const saveHistory = (newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Ошибка сохранения истории поиска:', error);
    }
  };

  const saveFavorites = (newFavorites: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Ошибка сохранения избранных поисков:', error);
    }
  };

  // Добавление нового поиска в историю
  const addToHistory = (query: string, resultsCount: number, filters?: any) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      resultsCount,
      filters,
      clickCount: 1
    };

    // Проверяем, есть ли уже такой поиск
    const existingIndex = history.findIndex(item => 
      item.query.toLowerCase() === query.toLowerCase() &&
      JSON.stringify(item.filters) === JSON.stringify(filters)
    );

    let newHistory: SearchHistoryItem[];
    
    if (existingIndex >= 0) {
      // Обновляем существующий элемент
      newHistory = [...history];
      newHistory[existingIndex] = {
        ...newHistory[existingIndex],
        timestamp: new Date(),
        resultsCount,
        clickCount: (newHistory[existingIndex].clickCount || 0) + 1
      };
      // Перемещаем в начало списка
      const updatedItem = newHistory.splice(existingIndex, 1)[0];
      newHistory.unshift(updatedItem);
    } else {
      // Добавляем новый элемент в начало
      newHistory = [newItem, ...history];
    }

    // Ограничиваем количество элементов
    if (newHistory.length > 50) {
      newHistory = newHistory.slice(0, 50);
    }

    saveHistory(newHistory);
  };

  // Удаление элемента из истории
  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  // Очистка всей истории
  const clearHistory = () => {
    saveHistory([]);
    setClearDialogOpen(false);
  };

  // Добавление/удаление из избранного
  const toggleFavorite = (item: SearchHistoryItem) => {
    const isCurrentlyFavorite = favorites.some(fav => fav.id === item.id);
    
    if (isCurrentlyFavorite) {
      // Удаляем из избранного
      const newFavorites = favorites.filter(fav => fav.id !== item.id);
      saveFavorites(newFavorites);
    } else {
      // Добавляем в избранное
      const favoriteItem = { ...item, isFavorite: true };
      const newFavorites = [favoriteItem, ...favorites];
      // Ограничиваем количество избранных
      if (newFavorites.length > 20) {
        newFavorites.splice(20);
      }
      saveFavorites(newFavorites);
    }
  };

  // Обработка клика по элементу истории
  const handleHistoryClick = (item: SearchHistoryItem) => {
    onSearchSelect(item.query, item.filters);
    
    // Увеличиваем счетчик кликов
    const newHistory = history.map(historyItem => 
      historyItem.id === item.id 
        ? { ...historyItem, clickCount: (historyItem.clickCount || 0) + 1 }
        : historyItem
    );
    saveHistory(newHistory);
  };

  // Форматирование времени
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return timestamp.toLocaleDateString('ru');
  };

  // Создание описания фильтров
  const getFiltersDescription = (filters?: any) => {
    if (!filters) return null;
    
    const parts = [];
    if (filters.diameter) parts.push(`R${filters.diameter}`);
    if (filters.brand) parts.push(filters.brand);
    if (filters.year) parts.push(`${filters.year} г.`);
    
    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Получение элементов для отображения
  const getDisplayItems = () => {
    const itemsToShow = showAll ? history : history.slice(0, maxItems);
    return itemsToShow;
  };

  // Проверка, является ли элемент избранным
  const isFavorite = (item: SearchHistoryItem) => {
    return favorites.some(fav => fav.id === item.id);
  };

  // Expose addToHistory для использования в родительском компоненте
  React.useImperativeHandle(React.useRef(), () => ({
    addToHistory
  }));

  if (history.length === 0 && favorites.length === 0) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 2, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Заголовок */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: compact ? 'pointer' : 'default'
        }}
        onClick={compact ? () => setExpanded(!expanded) : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            История поиска
          </Typography>
          {history.length > 0 && (
            <Chip 
              label={history.length} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {history.length > 0 && (
            <Tooltip title="Очистить историю">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  setClearDialogOpen(true);
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
          {compact && (
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        {/* Избранные поиски */}
        {showFavorites && favorites.length > 0 && (
          <Box>
            <Box sx={{ px: 2, py: 1, bgcolor: 'warning.50' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                <BookmarkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Избранные поиски
              </Typography>
            </Box>
            <List dense>
              {favorites.slice(0, 5).map((item) => (
                <ListItem key={`fav-${item.id}`} disablePadding>
                  <ListItemButton onClick={() => handleHistoryClick(item)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SearchIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {item.query}
                          </Typography>
                          {item.resultsCount > 0 && (
                            <Chip 
                              label={`${item.resultsCount} результатов`}
                              size="small"
                              variant="outlined"
                              color="success"
                            />
                          )}
                        </Box>
                      }
                      secondary={getFiltersDescription(item.filters)}
                    />
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                    >
                      <BookmarkIcon color="warning" fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
          </Box>
        )}

        {/* История поиска */}
        {history.length > 0 ? (
          <Box>
            <List dense>
              {getDisplayItems().map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => handleHistoryClick(item)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SearchIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {item.query}
                          </Typography>
                          {item.resultsCount > 0 && (
                            <Chip 
                              label={`${item.resultsCount}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                          {item.clickCount && item.clickCount > 1 && (
                            <Chip 
                              label={`${item.clickCount}x`}
                              size="small"
                              variant="filled"
                              color="secondary"
                              icon={<TrendingUpIcon />}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(item.timestamp)}
                          </Typography>
                          {getFiltersDescription(item.filters) && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getFiltersDescription(item.filters)}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={isFavorite(item) ? "Удалить из избранного" : "Добавить в избранное"}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                        >
                          {isFavorite(item) ? (
                            <BookmarkIcon color="warning" fontSize="small" />
                          ) : (
                            <BookmarkBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить из истории">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Показать больше */}
            {history.length > maxItems && !showAll && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  onClick={() => setShowAll(true)}
                  startIcon={<ExpandMoreIcon />}
                >
                  Показать еще {history.length - maxItems} запросов
                </Button>
              </Box>
            )}

            {showAll && history.length > maxItems && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  onClick={() => setShowAll(false)}
                  startIcon={<ExpandLessIcon />}
                >
                  Свернуть
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              История поиска пуста
            </Typography>
          </Box>
        )}
      </Collapse>

      {/* Диалог подтверждения очистки */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Очистить историю поиска?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Это действие нельзя отменить. Вся история поиска будет удалена.
          </Alert>
          <Typography variant="body2">
            Будет удалено: <strong>{history.length}</strong> запросов
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={clearHistory} color="error" variant="contained">
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// Хук для использования истории поиска
export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  const addToHistory = (query: string, resultsCount: number, filters?: any) => {
    // Эта функция будет вызываться из компонента SearchHistory
    // через ref или контекст
  };

  return {
    history,
    addToHistory
  };
};

export default SearchHistory;