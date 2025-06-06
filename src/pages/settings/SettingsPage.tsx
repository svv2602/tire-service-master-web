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
  SelectChangeEvent,
  useTheme,
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
} from '../../styles';

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

// Интерфейс для панелей настроек
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Панель с контентом вкладки
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      sx={{
        py: SIZES.spacing.lg,
        px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg }
      }}
    >
      {value === index && children}
    </Box>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const SettingsPage: React.FC = () => {
  // Получение темы и централизованных стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const formStyles = getFormStyles(theme);

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
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Обработчик изменения текстовых полей
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
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
    <Box sx={{ 
      width: '100%',
      maxWidth: 1200,
      mx: 'auto',
      px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg },
    }}>
      <Paper 
        elevation={0}
        sx={{
          ...cardStyles,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              sx: {
                height: 3,
                borderRadius: SIZES.borderRadius.sm,
              }
            }}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tab 
              icon={<SettingsIcon />} 
              label="Общие" 
              {...a11yProps(0)}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: SIZES.fontSize.md,
                transition: ANIMATIONS.transition.fast,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <Tab 
              icon={<NotificationsIcon />} 
              label="Уведомления" 
              {...a11yProps(1)}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: SIZES.fontSize.md,
                transition: ANIMATIONS.transition.fast,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Безопасность" 
              {...a11yProps(2)}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: SIZES.fontSize.md,
                transition: ANIMATIONS.transition.fast,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <Tab 
              icon={<DevicesIcon />} 
              label="Интеграции" 
              {...a11yProps(3)}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: SIZES.fontSize.md,
                transition: ANIMATIONS.transition.fast,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          </Tabs>
        </Box>

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
                ...formStyles.container
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
                    sx={textFieldStyles}
                  />

                  <TextField
                    fullWidth
                    label="Контактный Email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleTextChange}
                    sx={textFieldStyles}
                  />

                  <TextField
                    fullWidth
                    label="Телефон поддержки"
                    name="supportPhone"
                    value={settings.supportPhone}
                    onChange={handleTextChange}
                    sx={textFieldStyles}
                  />

                  <FormControl fullWidth sx={textFieldStyles}>
                    <InputLabel>Город по умолчанию</InputLabel>
                    <Select
                      name="defaultCityId"
                      value={settings.defaultCityId}
                      label="Город по умолчанию"
                      onChange={handleSelectChange}
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
                  <FormControl fullWidth sx={textFieldStyles}>
                    <InputLabel>Формат даты</InputLabel>
                    <Select
                      name="dateFormat"
                      value={settings.dateFormat}
                      label="Формат даты"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={textFieldStyles}>
                    <InputLabel>Формат времени</InputLabel>
                    <Select
                      name="timeFormat"
                      value={settings.timeFormat}
                      label="Формат времени"
                      onChange={handleSelectChange}
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
                    sx={buttonStyles}
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
                ...formStyles.container
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                  mb: SIZES.spacing.sm
                }}>
                  Настройки уведомлений
                </Typography>
                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleToggleChange(e, 'emailNotifications')}
                      name="emailNotifications"
                    />
                  }
                  label="Получать уведомления по email"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleToggleChange(e, 'smsNotifications')}
                      name="smsNotifications"
                    />
                  }
                  label="Получать SMS уведомления"
                />

                <Box sx={{ mt: SIZES.spacing.lg }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || updating}
                    sx={buttonStyles}
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
                ...formStyles.container
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
                    sx={buttonStyles}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка интеграций */}
            <TabPanel value={tabValue} index={3}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: SIZES.spacing.lg,
                  borderRadius: SIZES.borderRadius.sm 
                }}
              >
                Модуль интеграций находится в разработке и будет доступен в ближайшем обновлении.
              </Alert>
              
              <Typography variant="body1" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: SIZES.fontSize.md
              }}>
                В разделе интеграций вы сможете настроить взаимодействие с внешними системами, такими как CRM, 
                платежные сервисы и мессенджеры.
              </Typography>
            </TabPanel>
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ 
            borderRadius: SIZES.borderRadius.sm,
            width: '100%' 
          }}
        >
          Настройки успешно сохранены
        </Alert>
      </Snackbar>

      {/* Уведомление об ошибке */}
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error"
            sx={{ 
              borderRadius: SIZES.borderRadius.sm,
              width: '100%' 
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default SettingsPage;