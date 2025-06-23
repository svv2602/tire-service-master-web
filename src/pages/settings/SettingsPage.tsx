import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Tab,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../api';
import { useGetCitiesQuery } from '../../api/cities.api';
import {
  SIZES,
  ANIMATIONS,
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getFormStyles,
  getTablePageStyles,
} from '../../styles';

// Импорты UI компонентов
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { Switch } from '../../components/ui/Switch';
import { Snackbar } from '../../components/ui/Snackbar';

// Интерфейс для настроек системы
interface SystemSettings {
  systemName: string;
  contactEmail: string;
  supportPhone: string;
  defaultCityId: string;
  dateFormat: string;
  timeFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const SettingsPage: React.FC = () => {
  // Получение темы и централизованных стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const formStyles = getFormStyles(theme);
  const tablePageStyles = getTablePageStyles(theme);

  // Получение данных
  const { data: settingsData, isLoading: loading } = useGetSettingsQuery();
  const { data: citiesData } = useGetCitiesQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  
  const cities = citiesData?.data || [];
  
  // Состояния
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<SystemSettings>(() => ({
    systemName: '',
    contactEmail: '',
    supportPhone: '',
    defaultCityId: '',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    emailNotifications: false,
    smsNotifications: false,
  }));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обновление настроек при загрузке данных
  useEffect(() => {
    if (settingsData) {
      const settingsToSet: SystemSettings = {
        systemName: settingsData.systemName,
        contactEmail: settingsData.contactEmail,
        supportPhone: settingsData.supportPhone,
        defaultCityId: String(settingsData.defaultCityId),
        dateFormat: settingsData.dateFormat,
        timeFormat: settingsData.timeFormat,
        emailNotifications: settingsData.emailNotifications,
        smsNotifications: settingsData.smsNotifications,
      };
      setSettings(settingsToSet);
    }
  }, [settingsData]);

  // Обработчик изменения вкладки
  const handleTabChange = (newValue: string | number) => {
    setTabValue(newValue as number);
  };

  // Обработчик изменения текстовых полей
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения выпадающих списков
  const handleCityChange = (value: string | number) => {
    setSettings(prev => ({ ...prev, defaultCityId: value as string }));
  };

  const handleDateFormatChange = (value: string | number) => {
    setSettings(prev => ({ ...prev, dateFormat: value as string }));
  };

  const handleTimeFormatChange = (value: string | number) => {
    setSettings(prev => ({ ...prev, timeFormat: value as string }));
  };

  // Обработчик изменения переключателей
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SystemSettings) => {
    const { checked } = e.target;
    setSettings(prev => ({ ...prev, [field]: checked }));
  };

  // Обработчик сохранения настроек
  const handleSave = async () => {
    try {
      await updateSettings(settings).unwrap();
      setSaveSuccess(true);
    } catch (err) {
      setError('Произошла ошибка при сохранении настроек');
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

  // Подготовка данных для вкладок
  const tabs = [
    {
      label: 'Общие',
      value: 0,
      icon: <SettingsIcon />
    },
    {
      label: 'Уведомления',
      value: 1,
      icon: <NotificationsIcon />
    },
    {
      label: 'Безопасность',
      value: 2,
      icon: <SecurityIcon />
    },
    {
      label: 'Интеграции',
      value: 3,
      icon: <DevicesIcon />
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Box sx={{
        overflow: 'hidden'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          tabs={tabs}
          variant="scrollable"
        />

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: SIZES.spacing.xl 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Вкладка общих настроек */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: SIZES.spacing.lg,
                py: SIZES.spacing.lg,
                px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg }
              }}>
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600,
                    mb: SIZES.spacing.sm
                  }}>
                    Основные настройки
                  </Typography>
                  <Divider />
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: SIZES.spacing.md 
                }}>
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
                    <Select
                      name="defaultCityId"
                      value={settings.defaultCityId}
                      label="Город по умолчанию"
                      onChange={handleCityChange}
                      displayEmpty
                    >
                      {Array.isArray(cities) ? cities.map(city => (
                        <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                      )) : null}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ 
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600,
                    mb: SIZES.spacing.sm,
                    mt: SIZES.spacing.lg
                  }}>
                    Настройки отображения
                  </Typography>
                  <Divider sx={{ mb: SIZES.spacing.md }} />
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: SIZES.spacing.md 
                }}>
                  <FormControl fullWidth>
                    <Select
                      name="dateFormat"
                      value={settings.dateFormat}
                      label="Формат даты"
                      onChange={handleDateFormatChange}
                    >
                      <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <Select
                      name="timeFormat"
                      value={settings.timeFormat}
                      label="Формат времени"
                      onChange={handleTimeFormatChange}
                    >
                      <MenuItem value="24h">24-часовой (14:30)</MenuItem>
                      <MenuItem value="12h">12-часовой (2:30 PM)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mt: SIZES.spacing.xl }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || updating}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка уведомлений */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: SIZES.spacing.lg,
                py: SIZES.spacing.lg,
                px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg }
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                  mb: SIZES.spacing.sm
                }}>
                  Настройки уведомлений
                </Typography>
                <Divider />

                <Switch
                  label="Получать уведомления по email"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleToggleChange(e, 'emailNotifications')}
                />

                <Switch
                  label="Получать SMS уведомления"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleToggleChange(e, 'smsNotifications')}
                />

                <Box sx={{ mt: SIZES.spacing.lg }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || updating}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка безопасности */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: SIZES.spacing.lg,
                py: SIZES.spacing.lg,
                px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg }
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                  mb: SIZES.spacing.sm
                }}>
                  Настройки безопасности
                </Typography>
                <Divider />

                <Typography variant="body2" color="textSecondary">
                  Функции безопасности будут доступны в следующем обновлении.
                </Typography>

                <Box sx={{ mt: SIZES.spacing.lg }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || updating}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка интеграций */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ 
                py: SIZES.spacing.lg,
                px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg }
              }}>
                <Alert severity="info">
                  💡 Модуль интеграций находится в разработке и будет доступен в ближайшем обновлении.
                </Alert>
                
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: SIZES.fontSize.md
                }}>
                  В разделе интеграций вы сможете настроить взаимодействие с внешними системами, такими как CRM, 
                  платежные сервисы и мессенджеры.
                </Typography>
              </Box>
            </TabPanel>
          </>
        )}
      </Box>

      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        message="Настройки успешно сохранены"
        severity="success"
        onClose={handleCloseSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />

      {/* Уведомление об ошибке */}
      <Snackbar
        open={Boolean(error)}
        message={error || ''}
        severity="error"
        onClose={handleCloseError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default SettingsPage;