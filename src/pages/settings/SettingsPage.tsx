import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';
import { settingsApi, SystemSettings } from '../../api/settings';

// Интерфейс для панелей настроек
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Компонент для содержимого вкладки
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Вспомогательная функция для атрибутов вкладки
const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const SettingsPage: React.FC = () => {
  // Состояние для вкладок
  const [tabValue, setTabValue] = useState(0);
  
  // Состояние для сообщения об успешном сохранении
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Состояние для загрузки данных
  const [loading, setLoading] = useState(false);
  
  // Состояние для ошибок
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для списка городов
  const [cities, setCities] = useState<{id: number; name: string}[]>([]);
  
  // Состояние для настроек системы
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'Твоя шина',
    contactEmail: 'admin@tvoya-shina.ua',
    supportPhone: '+380 67 000 00 00',
    defaultCityId: 1,
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    slotDuration: 30,
    enableNotifications: true,
    enableSmsNotifications: false,
    maxBookingsPerDay: 50,
    workdayStart: '09:00',
    workdayEnd: '18:00',
    workDays: [1, 2, 3, 4, 5], // Пн-Пт
  });

  // Загрузка настроек при первом рендере компонента
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Загрузка списка городов
        const citiesResponse = await settingsApi.getCities();
        setCities(citiesResponse.data);
        
        // Загрузка системных настроек
        const settingsResponse = await settingsApi.getSystemSettings();
        setSettings(settingsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке настроек:', err);
        setError('Не удалось загрузить настройки. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Обработчик изменения текстовых полей
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  // Обработчик изменения переключателей
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings({
      ...settings,
      [name]: checked,
    });
  };

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as string;
    const value = event.target.value;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  // Обработчик сохранения настроек
  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Отправка данных на сервер
      await settingsApi.updateSystemSettings(settings);
      
      // Показываем сообщение об успешном сохранении
      setSaveSuccess(true);
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err);
      setError('Не удалось сохранить настройки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик закрытия сообщения
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  // Обработчик закрытия сообщения об ошибке
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Настройки системы
      </Typography>

      {error && (
        <Alert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<SettingsIcon />} label="Общие" {...a11yProps(0)} />
            <Tab icon={<NotificationsIcon />} label="Уведомления" {...a11yProps(1)} />
            <Tab icon={<SecurityIcon />} label="Безопасность" {...a11yProps(2)} />
            <Tab icon={<DevicesIcon />} label="Интеграции" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Вкладка общих настроек */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Основные настройки
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Название системы"
                    name="systemName"
                    value={settings.systemName}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label="Контактный Email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label="Телефон поддержки"
                    name="supportPhone"
                    value={settings.supportPhone}
                    onChange={handleTextChange}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Город по умолчанию</InputLabel>
                    <Select
                      name="defaultCityId"
                      value={settings.defaultCityId}
                      label="Город по умолчанию"
                      onChange={handleSelectChange as any}
                    >
                      {cities.map(city => (
                        <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Параметры бронирования
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Длительность слота (мин.)"
                    name="slotDuration"
                    type="number"
                    value={settings.slotDuration}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label="Максимум бронирований в день"
                    name="maxBookingsPerDay"
                    type="number"
                    value={settings.maxBookingsPerDay}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label="Начало рабочего дня"
                    name="workdayStart"
                    type="time"
                    value={settings.workdayStart}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label="Конец рабочего дня"
                    name="workdayEnd"
                    type="time"
                    value={settings.workdayEnd}
                    onChange={handleTextChange}
                  />
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка уведомлений */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Настройки уведомлений
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={handleSwitchChange}
                        name="enableNotifications"
                        color="primary"
                      />
                    }
                    label="Включить уведомления по email"
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableSmsNotifications}
                        onChange={handleSwitchChange}
                        name="enableSmsNotifications"
                        color="primary"
                      />
                    }
                    label="Включить SMS-уведомления"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Формат даты</InputLabel>
                    <Select
                      name="dateFormat"
                      value={settings.dateFormat}
                      label="Формат даты"
                      onChange={handleSelectChange as any}
                    >
                      <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Формат времени</InputLabel>
                    <Select
                      name="timeFormat"
                      value={settings.timeFormat}
                      label="Формат времени"
                      onChange={handleSelectChange as any}
                    >
                      <MenuItem value="24h">24-часовой (14:30)</MenuItem>
                      <MenuItem value="12h">12-часовой (2:30 PM)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка безопасности */}
            <TabPanel value={tabValue} index={2}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Настройки безопасности доступны только администраторам с полными правами.
              </Alert>
              
              <Typography>
                В разделе безопасности вы можете настроить политики паролей, доступа и другие параметры безопасности системы.
                В данный момент эта функциональность находится в разработке.
              </Typography>
            </TabPanel>

            {/* Вкладка интеграций */}
            <TabPanel value={tabValue} index={3}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Модуль интеграций находится в разработке и будет доступен в ближайшем обновлении.
              </Alert>
              
              <Typography>
                В разделе интеграций вы сможете настроить взаимодействие с внешними системами, такими как CRM, 
                платежные сервисы и мессенджеры.
              </Typography>
            </TabPanel>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                Сохранить настройки
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Настройки успешно сохранены!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 