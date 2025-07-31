import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Science as TestIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// Типы данных
interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  type?: 'string' | 'integer' | 'boolean' | 'password' | 'url' | 'select';
  options?: string[];
  min_value?: number;
  max_value?: number;
  required?: boolean;
  default?: boolean;
  updated_at?: string;
  updated_by?: string;
}

interface SettingCategory {
  name: string;
  description: string;
  icon: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  
  // Состояние компонента
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState<Record<string, Record<string, SystemSetting>>>({});
  const [categories, setCategories] = useState<Record<string, SettingCategory>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // API базовый URL
  const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1`;
  
  // Получаем токен аутентификации
  const authToken = useSelector((state: any) => state.auth?.accessToken);

  // Функция для получения заголовков с авторизацией
  const getAuthHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      (headers as any)['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  // Загрузка настроек
  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/system_settings`, {
          credentials: 'include',
          headers: getAuthHeaders()
        }),
        fetch(`${API_BASE_URL}/admin/system_settings/categories`, {
          credentials: 'include',
          headers: getAuthHeaders()
        })
      ]);

      if (settingsResponse.ok && categoriesResponse.ok) {
        const settingsData = await settingsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setSettings(settingsData.settings || {});
        setCategories(categoriesData.categories || {});
      } else {
        throw new Error('Ошибка загрузки настроек');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Ошибка загрузки настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение настройки
  const saveSetting = async (key: string, value: string) => {
    setSaving(key);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system_settings/${key}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Обновляем настройку в состоянии
        setSettings(prev => {
          const newSettings = { ...prev };
          const category = data.setting.category;
          if (newSettings[category]) {
            newSettings[category][key] = data.setting;
          }
          return newSettings;
        });
        
        // Убираем из ожидающих изменений
        setPendingChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[key];
          return newChanges;
        });
        
        showNotification(`Настройка "${key}" сохранена`, 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      showNotification(`Ошибка сохранения: ${error}`, 'error');
    } finally {
      setSaving(null);
    }
  };

  // Тестирование подключения
  const testConnection = async (key: string, value: string) => {
    setTesting(key);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system_settings/test_connection`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(data.message, data.success ? 'success' : 'error');
      } else {
        throw new Error('Ошибка тестирования');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      showNotification(`Ошибка тестирования: ${error}`, 'error');
    } finally {
      setTesting(null);
    }
  };

  // Сброс к значениям по умолчанию
  const resetToDefaults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system_settings/reset_defaults`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
        setPendingChanges({});
        showNotification('Настройки сброшены к значениям по умолчанию', 'success');
      } else {
        throw new Error('Ошибка сброса настроек');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification(`Ошибка сброса: ${error}`, 'error');
    }
  };

  // Обработка изменения значения
  const handleValueChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Получение текущего значения (с учетом ожидающих изменений)
  const getCurrentValue = (key: string, originalValue: string) => {
    return pendingChanges[key] !== undefined ? pendingChanges[key] : originalValue;
  };

  // Проверка наличия изменений
  const hasChanges = (key: string) => {
    return pendingChanges[key] !== undefined;
  };

  // Показать уведомление
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity });
  };

  // Получение иконки категории
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      search: <SearchIcon />,
      link: <LinkIcon />,
      storage: <StorageIcon />,
      analytics: <AnalyticsIcon />,
      speed: <SpeedIcon />,
      settings: <SettingsIcon />
    };
    return icons[iconName] || <SettingsIcon />;
  };

  // Рендер поля настройки
  const renderSettingField = (setting: SystemSetting, isSaving: boolean, isTesting: boolean) => {
    const currentValue = getCurrentValue(setting.key, setting.value);
    const isChanged = hasChanges(setting.key);

    switch (setting.type) {
      case 'boolean':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Switch
              checked={currentValue === 'true'}
              onChange={(e) => handleValueChange(setting.key, e.target.checked ? 'true' : 'false')}
              disabled={isSaving}
            />
            <Typography variant="body2" color={currentValue === 'true' ? 'success.main' : 'text.secondary'}>
              {currentValue === 'true' ? 'Включено' : 'Отключено'}
            </Typography>
          </Box>
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={currentValue}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              disabled={isSaving}
            >
              {setting.options?.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'password':
        return (
          <TextField
            fullWidth
            size="small"
            type={showPasswords[setting.key] ? 'text' : 'password'}
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            disabled={isSaving}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [setting.key]: !prev[setting.key]
                    }))}
                    size="small"
                  >
                    {showPasswords[setting.key] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        );

      case 'integer':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            disabled={isSaving}
            inputProps={{
              min: setting.min_value,
              max: setting.max_value
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            disabled={isSaving}
            multiline={setting.type === 'url' && currentValue.length > 50}
            rows={setting.type === 'url' && currentValue.length > 50 ? 2 : 1}
          />
        );
    }
  };

  // Проверка возможности тестирования
  const canTestConnection = (key: string) => {
    return ['redis_url', 'openai_api_key'].includes(key);
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadSettings();
  }, []);

  // Получение списка категорий для табов
  const categoryKeys = Object.keys(categories);
  const currentCategoryKey = categoryKeys[currentTab] || 'general';
  const currentCategorySettings = settings[currentCategoryKey] || {};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Системные настройки
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSettings}
            disabled={loading}
          >
            Обновить
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestoreIcon />}
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Сброс настроек',
              message: 'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию? Это действие нельзя отменить.',
              onConfirm: () => {
                resetToDefaults();
                setConfirmDialog(prev => ({ ...prev, open: false }));
              }
            })}
          >
            Сбросить
          </Button>
        </Box>
      </Box>

      {/* Информация о несохраненных изменениях */}
      {Object.keys(pendingChanges).length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          У вас есть несохраненные изменения в {Object.keys(pendingChanges).length} настройках.
          Не забудьте сохранить их.
        </Alert>
      )}

      {/* Табы категорий */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categoryKeys.map((categoryKey, index) => {
            const category = categories[categoryKey];
            const categorySettingsCount = Object.keys(settings[categoryKey] || {}).length;
            const changedInCategory = Object.keys(pendingChanges).filter(key => 
              Object.keys(settings[categoryKey] || {}).includes(key)
            ).length;
            
            return (
              <Tab
                key={categoryKey}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCategoryIcon(category.icon)}
                    <Typography variant="body2">
                      {category.name}
                    </Typography>
                    <Chip 
                      label={categorySettingsCount} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {changedInCategory > 0 && (
                      <Chip 
                        label={changedInCategory} 
                        size="small" 
                        color="warning"
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Содержимое вкладок */}
      {categoryKeys.map((categoryKey, index) => {
        const category = categories[categoryKey];
        const categorySettings = settings[categoryKey] || {};
        
        return (
          <TabPanel key={categoryKey} value={currentTab} index={index}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {Object.entries(categorySettings).map(([key, setting]) => {
                const isSaving = saving === key;
                const isTesting = testing === key;
                
                return (
                <Grid item xs={12} key={key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {key}
                            </Typography>
                            {setting.default && (
                              <Chip label="По умолчанию" size="small" variant="outlined" />
                            )}
                            {hasChanges(key) && (
                              <Chip label="Изменено" size="small" color="warning" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {setting.description}
                          </Typography>
                          
                          {/* Дополнительная информация */}
                          {(setting.min_value !== undefined || setting.max_value !== undefined) && (
                            <Typography variant="caption" color="text.secondary">
                              Диапазон: {setting.min_value || '∞'} - {setting.max_value || '∞'}
                            </Typography>
                          )}
                        </Box>
                        
                        {setting.updated_at && (
                          <Typography variant="caption" color="text.secondary">
                            Обновлено: {new Date(setting.updated_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>

                      {/* Поле ввода */}
                      <Box sx={{ mb: 2 }}>
                        {renderSettingField(setting, isSaving, isTesting)}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                          onClick={() => saveSetting(key, getCurrentValue(key, setting.value))}
                          disabled={!hasChanges(key) || isSaving}
                        >
                          {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        
                        {canTestConnection(key) && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                            onClick={() => testConnection(key, getCurrentValue(key, setting.value))}
                            disabled={isTesting}
                          >
                            {isTesting ? 'Тестирование...' : 'Тест'}
                          </Button>
                        )}
                      </Box>
                      
                      {hasChanges(key) && (
                        <Button
                          size="small"
                          onClick={() => setPendingChanges(prev => {
                            const newChanges = { ...prev };
                            delete newChanges[key];
                            return newChanges;
                          })}
                        >
                          Отменить
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
                );
              })}
            </Grid>
          </TabPanel>
        );
      })}

      {/* Диалог подтверждения */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Отмена
          </Button>
          <Button onClick={confirmDialog.onConfirm} color="warning" variant="contained">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettingsPage;