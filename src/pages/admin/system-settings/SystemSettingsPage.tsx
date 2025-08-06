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
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as TireDataIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TireDataManagement from '../../../components/admin/TireDataManagement';

// Типы данных
interface SystemSetting {
  key: string;
  value: string | boolean | number; // Поддерживаем разные типы значений
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
  const saveSetting = async (key: string, value: string | boolean | number) => {
    console.log('💾 Saving setting:', { key, value });
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
        console.log('✅ Setting saved successfully:', data);
        console.log('📝 Updating settings state:', { 
          key, 
          category: data.setting?.category, 
          newValue: data.setting?.value,
          oldValue: getCurrentValue(key, '') 
        });
        
        // Обновляем настройку в состоянии
        setSettings(prev => {
          const newSettings = { ...prev };
          const category = data.setting.category;
          if (newSettings[category] && data.setting) {
            console.log('🔄 Before update:', newSettings[category][key]);
            newSettings[category][key] = data.setting;
            console.log('🔄 After update:', newSettings[category][key]);
          } else {
            console.warn('⚠️ Category not found or setting missing:', { category, settingExists: !!data.setting });
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
        console.error('❌ Server error response:', { status: response.status, error: errorData });
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('❌ Error saving setting:', error);
      showNotification(`Ошибка сохранения: ${error}`, 'error');
    } finally {
      setSaving(null);
    }
  };

  // Тестирование подключения
  const testConnection = async (key: string, value: string | boolean | number) => {
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
    
    // TODO: Добавить debounced автосохранение
  };

  // Получение текущего значения (с учетом ожидающих изменений)
  const getCurrentValue = (key: string, originalValue: string | boolean | number) => {
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
      settings: <SettingsIcon />,
      tire_data: <TireDataIcon />
    };
    return icons[iconName] || <SettingsIcon />;
  };

  // Рендер поля настройки
  const renderSettingField = (setting: SystemSetting, isSaving: boolean, isTesting: boolean) => {
    const currentValue = getCurrentValue(setting.key, setting.value);
    const isChanged = hasChanges(setting.key);

    switch (setting.type) {
      case 'boolean':
        // Обработка boolean значений - API может возвращать как boolean, так и строку
        const isBooleanChecked = currentValue === true || currentValue === 'true' || currentValue === '1';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Switch
              checked={isBooleanChecked}
              onChange={(e) => {
                const newValue = e.target.checked ? 'true' : 'false';
                handleValueChange(setting.key, newValue);
                // Автосохранение для boolean полей
                saveSetting(setting.key, newValue);
              }}
              disabled={isSaving}
            />
            <Typography variant="body2" color={isBooleanChecked ? 'success.main' : 'text.secondary'}>
              {isBooleanChecked ? 'Включено' : 'Отключено'}
            </Typography>
            {isSaving && (
              <CircularProgress size={16} />
            )}
          </Box>
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={String(currentValue)}
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
            value={String(currentValue)}
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
            value={String(currentValue)}
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
            value={String(currentValue)}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            disabled={isSaving}
            multiline={setting.type === 'url' && String(currentValue).length > 50}
            rows={setting.type === 'url' && String(currentValue).length > 50 ? 2 : 1}
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

  // Группировка категорий для новых табов
  const tabGroups = [
    {
      name: 'Поиск и интеграции',
      icon: <SearchIcon />,
      categories: ['tire_search', 'integrations', 'database'],
      description: 'Настройки поиска шин, интеграций с внешними сервисами и базы данных'
    },
    {
      name: 'Аналитика и производительность', 
      icon: <AnalyticsIcon />,
      categories: ['analytics', 'performance'],
      description: 'Настройки аналитики и производительности системы'
    }
  ];

  // Получение настроек для текущего таба
  const getCurrentTabSettings = () => {
    const currentGroup = tabGroups[currentTab];
    if (!currentGroup) return {};
    
    const groupSettings: Record<string, SystemSetting> = {};
    currentGroup.categories.forEach(categoryKey => {
      const categorySettings = settings[categoryKey] || {};
      Object.entries(categorySettings).forEach(([key, setting]) => {
        groupSettings[key] = setting;
      });
    });
    
    return groupSettings;
  };

  const currentTabSettings = getCurrentTabSettings();

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
          {tabGroups.map((group, index) => {
            // Подсчитываем общее количество настроек в группе
            const groupSettingsCount = group.categories.reduce((count, categoryKey) => {
              return count + Object.keys(settings[categoryKey] || {}).length;
            }, 0);
            
            // Подсчитываем изменения в группе
            const changedInGroup = Object.keys(pendingChanges).filter(key => {
              return group.categories.some(categoryKey => 
                Object.keys(settings[categoryKey] || {}).includes(key)
              );
            }).length;
            
            return (
              <Tab
                key={`group-${index}`}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {group.icon}
                    <Typography variant="body2">
                      {group.name}
                    </Typography>
                    <Chip 
                      label={groupSettingsCount} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {changedInGroup > 0 && (
                      <Chip 
                        label={changedInGroup} 
                        size="small" 
                        color="warning"
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
          
          {/* Специальный таб для управления данными шин */}
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TireDataIcon />
                <Typography variant="body2">
                  Данные шин
                </Typography>
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Содержимое вкладок */}
      {tabGroups.map((group, index) => (
        <TabPanel key={`tab-${index}`} value={currentTab} index={index}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.description}
              </Typography>
            </Box>

            {/* Группировка настроек по категориям */}
            {group.categories.map((categoryKey) => {
              const categorySettings = settings[categoryKey] || {};
              const categoryInfo = categories[categoryKey];
              
              if (Object.keys(categorySettings).length === 0) return null;
              
              return (
                <Box key={categoryKey} sx={{ mb: 4 }}>
                  <Box sx={{ 
                    mb: 2, 
                    pb: 1, 
                    borderBottom: '2px solid', 
                    borderColor: 'primary.main',
                    borderRadius: '2px'
                  }}>
                    <Typography variant="h6" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'primary.main'
                    }}>
                      {getCategoryIcon(categoryInfo?.icon || 'settings')}
                      {categoryInfo?.name || categoryKey}
                    </Typography>
                    {categoryInfo?.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5 }}>
                        {categoryInfo.description}
                      </Typography>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    {Object.entries(categorySettings).map(([key, setting]) => {
                      const isSaving = saving === key;
                      const isTesting = testing === key;
                      
                      return (
                      <Grid item xs={12} md={6} lg={4} key={key}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: '0.9rem' }}>
                            {key}
                          </Typography>
                          {setting.default && (
                            <Chip label="По умолчанию" size="small" variant="outlined" />
                          )}
                          {hasChanges(key) && (
                            <Chip label="Изменено" size="small" color="warning" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                          {setting.description}
                        </Typography>
                        
                        {/* Дополнительная информация */}
                        {(setting.min_value !== undefined || setting.max_value !== undefined) && (
                          <Typography variant="caption" color="text.secondary">
                            Диапазон: {setting.min_value || '∞'} - {setting.max_value || '∞'}
                          </Typography>
                        )}
                      </Box>

                      {/* Поле ввода */}
                      <Box sx={{ mb: 2 }}>
                        {renderSettingField(setting, isSaving, isTesting)}
                      </Box>
                      
                      {setting.updated_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Обновлено: {new Date(setting.updated_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {/* Скрываем кнопку сохранения для boolean полей (автосохранение) */}
                        {setting.type !== 'boolean' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                            onClick={() => saveSetting(key, getCurrentValue(key, setting.value))}
                            disabled={!hasChanges(key) || isSaving}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                          </Button>
                        )}
                        
                        {canTestConnection(key) && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                            onClick={() => testConnection(key, getCurrentValue(key, setting.value))}
                            disabled={isTesting}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {isTesting ? 'Тестирование...' : 'Тест'}
                          </Button>
                        )}
                        
                        {hasChanges(key) && setting.type !== 'boolean' && (
                          <Button
                            size="small"
                            onClick={() => setPendingChanges(prev => {
                              const newChanges = { ...prev };
                              delete newChanges[key];
                              return newChanges;
                            })}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Отменить
                          </Button>
                        )}
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })}
        </TabPanel>
      ))}

      {/* Специальный таб для управления данными шин */}
      <TabPanel value={currentTab} index={tabGroups.length}>
        <TireDataManagement />
      </TabPanel>

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