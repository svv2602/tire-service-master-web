import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { useLocalizedName } from '../utils/localizationHelpers';

const LocalizationDebug: React.FC = () => {
  const { i18n } = useTranslation();
  const getLocalizedName = useLocalizedName();
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Тестовые данные города
  const testCity = {
    id: 67,
    name: "Київ",
    name_ru: "Киев", 
    name_uk: "Київ"
  };

  const updateDebugInfo = () => {
    const info = {
      i18n_language: i18n.language,
      localStorage_i18nextLng: localStorage.getItem('i18nextLng'),
      navigator_language: navigator.language,
      localizedName_result: getLocalizedName(testCity),
      expected_ru: 'Киев',
      expected_uk: 'Київ'
    };
    setDebugInfo(info);
    console.log('🔍 Debug info:', info);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [i18n.language]);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setTimeout(updateDebugInfo, 100); // Небольшая задержка для обновления
  };

  const isCorrect = () => {
    if (debugInfo.i18n_language === 'ru') {
      return debugInfo.localizedName_result === debugInfo.expected_ru;
    } else if (debugInfo.i18n_language === 'uk') {
      return debugInfo.localizedName_result === debugInfo.expected_uk;
    }
    return false;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        🌍 Отладка локализации
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Тестовые данные города:
          </Typography>
          <Typography variant="body2">
            • name: "{testCity.name}"<br/>
            • name_ru: "{testCity.name_ru}"<br/>
            • name_uk: "{testCity.name_uk}"
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Информация о языке:
          </Typography>
          <Typography variant="body2">
            • i18n.language: "{debugInfo.i18n_language}"<br/>
            • localStorage.getItem('i18nextLng'): "{debugInfo.localStorage_i18nextLng}"<br/>
            • navigator.language: "{debugInfo.navigator_language}"
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Результат локализации:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Результат: "{debugInfo.localizedName_result}"
          </Typography>
          <Typography variant="body2">
            Ожидаемый для ru: "{debugInfo.expected_ru}"<br/>
            Ожидаемый для uk: "{debugInfo.expected_uk}"
          </Typography>
          
          <Alert severity={isCorrect() ? 'success' : 'error'} sx={{ mt: 2 }}>
            {isCorrect() ? '✅ ПРАВИЛЬНО' : '❌ ОШИБКА'}
          </Alert>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => changeLanguage('ru')}
          color={debugInfo.i18n_language === 'ru' ? 'primary' : 'secondary'}
        >
          Русский
        </Button>
        <Button 
          variant="contained" 
          onClick={() => changeLanguage('uk')}
          color={debugInfo.i18n_language === 'uk' ? 'primary' : 'secondary'}
        >
          Українська
        </Button>
        <Button variant="outlined" onClick={updateDebugInfo}>
          Обновить
        </Button>
      </Box>
    </Box>
  );
};

export default LocalizationDebug; 