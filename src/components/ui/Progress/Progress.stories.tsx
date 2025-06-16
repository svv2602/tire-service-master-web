import React, { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react';
import { Progress, ProgressProps } from './Progress';
import { Box, Button, Typography, Stack } from '@mui/material';

export default {
  title: 'UI/Progress',
  component: Progress,
  argTypes: {
    variant: {
      control: 'select',
      options: ['linear', 'circular'],
      defaultValue: 'linear',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      defaultValue: 'primary',
    },
    value: {
      control: 'number',
      min: 0,
      max: 100,
      step: 1,
    },
    showValue: {
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      control: 'number',
      defaultValue: 40,
    },
    thickness: {
      control: 'number',
      defaultValue: 3.6,
    },
    height: {
      control: 'number',
      defaultValue: 4,
    },
  },
} as Meta;

const Template: Story<ProgressProps> = (args) => <Progress {...args} />;

// Основные варианты
export const Linear = Template.bind({});
Linear.args = {
  variant: 'linear',
  value: 60,
};

export const Circular = Template.bind({});
Circular.args = {
  variant: 'circular',
  value: 60,
};

export const LinearWithValue = Template.bind({});
LinearWithValue.args = {
  variant: 'linear',
  value: 75,
  showValue: true,
};

export const CircularWithValue = Template.bind({});
CircularWithValue.args = {
  variant: 'circular',
  value: 75,
  showValue: true,
};

export const IndeterminateLinear = Template.bind({});
IndeterminateLinear.args = {
  variant: 'linear',
};

export const IndeterminateCircular = Template.bind({});
IndeterminateCircular.args = {
  variant: 'circular',
};

// Цвета
export const Colors = () => (
  <Stack spacing={2}>
    <Progress variant="linear" value={60} color="primary" />
    <Progress variant="linear" value={60} color="secondary" />
    <Progress variant="linear" value={60} color="success" />
    <Progress variant="linear" value={60} color="error" />
    <Progress variant="linear" value={60} color="info" />
    <Progress variant="linear" value={60} color="warning" />
  </Stack>
);

// Размеры
export const CircularSizes = () => (
  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
    <Progress variant="circular" value={60} size={24} />
    <Progress variant="circular" value={60} size={40} />
    <Progress variant="circular" value={60} size={60} />
    <Progress variant="circular" value={60} size={80} />
  </Box>
);

export const LinearHeights = () => (
  <Stack spacing={2}>
    <Progress variant="linear" value={60} height={2} />
    <Progress variant="linear" value={60} height={4} />
    <Progress variant="linear" value={60} height={8} />
    <Progress variant="linear" value={60} height={12} />
  </Stack>
);

// Интерактивный пример
export const Interactive = () => {
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
          return prevProgress + 5;
        });
      }, 500);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const handleStart = () => {
    setProgress(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Progress variant="linear" value={progress} showValue />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleStart}
          disabled={isRunning}
        >
          Запустить
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleStop}
          disabled={!isRunning}
        >
          Остановить
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Progress variant="circular" value={progress} showValue size={100} thickness={5} />
      </Box>
    </Box>
  );
};

// Пример использования для загрузки файла
export const FileUploadExample = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ожидание загрузки');

  const handleUpload = () => {
    setStatus('Загрузка...');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + Math.random() * 10;
        
        if (nextProgress >= 100) {
          clearInterval(interval);
          setStatus('Загрузка завершена');
          return 100;
        }
        
        return nextProgress;
      });
    }, 300);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Загрузка файла
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Progress 
          variant="linear" 
          value={progress} 
          color={status === 'Загрузка завершена' ? 'success' : 'primary'} 
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {status} {progress > 0 && progress < 100 ? `(${Math.round(progress)}%)` : ''}
        </Typography>
        
        <Button 
          variant="contained" 
          size="small" 
          onClick={handleUpload}
          disabled={progress > 0 && progress < 100}
        >
          {progress === 100 ? 'Загрузить снова' : 'Загрузить'}
        </Button>
      </Box>
    </Box>
  );
};