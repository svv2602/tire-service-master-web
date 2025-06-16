import React, { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react';
import { Progress, ProgressProps } from './Progress';
import { Box, Button, Stack, Typography, Paper, Grid, Card, CardContent, CardActions } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

export default {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Progress - индикатор прогресса для отображения состояния загрузки или выполнения операции.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['circular', 'linear'],
      description: 'Тип индикатора прогресса',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'],
      description: 'Цвет индикатора',
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Значение прогресса (от 0 до 100)',
    },
    size: {
      control: { type: 'range', min: 16, max: 100, step: 4 },
      description: 'Размер кругового индикатора',
    },
    thickness: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Толщина линии',
    },
    showLabel: {
      control: 'boolean',
      description: 'Показать текст с процентами',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Неопределенный прогресс',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<ProgressProps> = (args) => <Progress {...args} />;

// Круговой индикатор
export const CircularProgress = Template.bind({});
CircularProgress.args = {
  variant: 'circular',
  value: 75,
  showLabel: true,
  size: 60,
  color: 'primary',
};

// Линейный индикатор
export const LinearProgress = Template.bind({});
LinearProgress.args = {
  variant: 'linear',
  value: 50,
  showLabel: true,
  color: 'secondary',
  sx: { width: 300 },
};

// Неопределенный прогресс
export const IndeterminateProgress = () => (
  <Stack spacing={3}>
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Круговой индикатор
      </Typography>
      <Progress variant="circular" indeterminate />
    </Box>
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Линейный индикатор
      </Typography>
      <Progress variant="linear" indeterminate showLabel sx={{ width: 300 }} />
    </Box>
  </Stack>
);

// Разные цвета
export const Colors = () => {
  const colors: Array<ProgressProps['color']> = ['primary', 'secondary', 'error', 'info', 'success', 'warning'];
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Круговые индикаторы
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          {colors.map((color) => (
            <Box key={color} sx={{ textAlign: 'center' }}>
              <Progress variant="circular" value={75} color={color} showLabel />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {color}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Линейные индикаторы
        </Typography>
        <Stack spacing={2}>
          {colors.map((color) => (
            <Box key={color}>
              <Progress variant="linear" value={75} color={color} showLabel sx={{ width: '100%' }} />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                {color}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
};

// Разные размеры
export const Sizes = () => {
  const sizes = [24, 40, 60, 80, 100];
  
  return (
    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
      {sizes.map((size) => (
        <Box key={size} sx={{ textAlign: 'center' }}>
          <Progress variant="circular" value={75} size={size} showLabel={size >= 40} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {size}px
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

// Анимированный прогресс
export const AnimatedProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning) {
      timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            setIsRunning(false);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 50);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  const handleStart = () => {
    setProgress(0);
    setIsRunning(true);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ width: '100%' }}>
        <Progress variant="linear" value={progress} showLabel sx={{ width: '100%' }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleStart} 
          disabled={isRunning}
        >
          Запустить
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setIsRunning(false)} 
          disabled={!isRunning}
        >
          Остановить
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setProgress(0)} 
          disabled={isRunning || progress === 0}
        >
          Сбросить
        </Button>
      </Box>
    </Stack>
  );
};

// Практические примеры использования
export const Examples = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let uploadTimer: NodeJS.Timeout;
    let saveTimer: NodeJS.Timeout;
    
    if (isUploading) {
      uploadTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            setIsUploading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }
    
    if (isSaving) {
      saveTimer = setInterval(() => {
        setSaveProgress((prev) => {
          if (prev >= 100) {
            setIsSaving(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
    
    return () => {
      clearInterval(uploadTimer);
      clearInterval(saveTimer);
    };
  }, [isUploading, isSaving]);

  const handleUpload = () => {
    setUploadProgress(0);
    setIsUploading(true);
  };

  const handleSave = () => {
    setSaveProgress(0);
    setIsSaving(true);
  };

  const handleLoadData = () => {
    setLoadingData(true);
    setTimeout(() => setLoadingData(false), 3000);
  };

  return (
    <Stack spacing={4}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Загрузка файла
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Progress 
            variant="linear" 
            value={uploadProgress} 
            showLabel 
            color={uploadProgress === 100 ? 'success' : 'primary'}
            label={uploadProgress === 100 ? 'Загрузка завершена' : 'Загрузка файла...'}
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />} 
          onClick={handleUpload} 
          disabled={isUploading}
        >
          {uploadProgress === 100 ? 'Загружено' : 'Загрузить файл'}
        </Button>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Сохранение данных
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Progress 
              variant="circular" 
              value={saveProgress} 
              showLabel 
              size={60}
              color={saveProgress === 100 ? 'success' : 'secondary'}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="body2">
              {saveProgress === 100 
                ? 'Данные успешно сохранены' 
                : isSaving 
                  ? 'Сохранение данных...' 
                  : 'Нажмите кнопку для сохранения данных'}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<SaveIcon />} 
              onClick={handleSave} 
              disabled={isSaving}
              sx={{ mt: 1 }}
            >
              {saveProgress === 100 ? 'Сохранено' : 'Сохранить'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Загрузка данных
        </Typography>
        <Card variant="outlined">
          <CardContent>
            {loadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Progress 
                  variant="circular" 
                  indeterminate 
                  size={50}
                  label="Загрузка данных..."
                />
              </Box>
            ) : (
              <Typography variant="body2">
                Данные будут отображены здесь после загрузки.
                Нажмите кнопку "Загрузить данные" для начала загрузки.
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={handleLoadData} 
              disabled={loadingData}
            >
              Загрузить данные
            </Button>
          </CardActions>
        </Card>
      </Paper>
    </Stack>
  );
};