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
import { useTranslation } from 'react-i18next';
import { useLocalizedName } from '../../utils/localizationHelpers';
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
  const { t } = useTranslation();
  const getLocalizedName = useLocalizedName();
  
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
      // Проверяем, что выбранный город существует в списке доступных городов
      const defaultCityIdStr = String(settingsData.defaultCityId);
      const cityExists = Array.isArray(cities) && cities.some(city => String(city.id) === defaultCityIdStr);
      
      const settingsToSet: SystemSettings = {
        systemName: settingsData.systemName,
        contactEmail: settingsData.contactEmail,
        supportPhone: settingsData.supportPhone,
        defaultCityId: cityExists ? defaultCityIdStr : '',
        dateFormat: settingsData.dateFormat,
        timeFormat: settingsData.timeFormat,
        emailNotifications: settingsData.emailNotifications,
        smsNotifications: settingsData.smsNotifications,
      };
      setSettings(settingsToSet);
    }
  }, [settingsData, cities]);

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
      setError(t('admin.settings.messages.saveError'));
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
      label: t('admin.settings.tabs.general'),
      value: 0,
      icon: <SettingsIcon />
    },
    {
      label: t('admin.settings.tabs.notifications'),
      value: 1,
      icon: <NotificationsIcon />
    },
    {
      label: t('admin.settings.tabs.security'),
      value: 2,
      icon: <SecurityIcon />
    },
    {
      label: t('admin.settings.tabs.integrations'),
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
                    {t('admin.settings.sections.basic')}
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
                    label={t('admin.settings.fields.systemName')}
                    name="systemName"
                    value={settings.systemName}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label={t('admin.settings.fields.contactEmail')}
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleTextChange}
                  />

                  <TextField
                    fullWidth
                    label={t('admin.settings.fields.supportPhone')}
                    name="supportPhone"
                    value={settings.supportPhone}
                    onChange={handleTextChange}
                  />

                  <FormControl fullWidth>
                    <Select
                      name="defaultCityId"
                      value={settings.defaultCityId}
                      label={t('admin.settings.fields.defaultCity')}
                      onChange={handleCityChange}
                      displayEmpty
                    >
                      {Array.isArray(cities) ? cities.map(city => (
                        <MenuItem key={city.id} value={city.id}>{getLocalizedName(city)}</MenuItem>
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
                    {t('admin.settings.sections.display')}
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
                      label={t('admin.settings.fields.dateFormat')}
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
                      label={t('admin.settings.fields.timeFormat')}
                      onChange={handleTimeFormatChange}
                    >
                      <MenuItem value="24h">{t('admin.settings.timeFormats.24h')}</MenuItem>
                      <MenuItem value="12h">{t('admin.settings.timeFormats.12h')}</MenuItem>
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
                    {t('admin.settings.buttons.saveChanges')}
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
                  {t('admin.settings.sections.notifications')}
                </Typography>
                <Divider />

                <Switch
                  label={t('admin.settings.fields.emailNotifications')}
                  checked={settings.emailNotifications}
                  onChange={(e) => handleToggleChange(e, 'emailNotifications')}
                />

                <Switch
                  label={t('admin.settings.fields.smsNotifications')}
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
                    {t('admin.settings.buttons.saveChanges')}
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
                  {t('admin.settings.sections.security')}
                </Typography>
                <Divider />

                <Typography variant="body2" color="textSecondary">
                  {t('admin.settings.messages.securityComingSoon')}
                </Typography>

                <Box sx={{ mt: SIZES.spacing.lg }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || updating}
                  >
                    {t('admin.settings.buttons.saveChanges')}
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
                  {t('admin.settings.messages.integrationsTitle')}
                </Alert>
                
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: SIZES.fontSize.md
                }}>
                  {t('admin.settings.messages.integrationsDescription')}
                </Typography>
              </Box>
            </TabPanel>
          </>
        )}
      </Box>

      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        message={t('admin.settings.messages.saveSuccess')}
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