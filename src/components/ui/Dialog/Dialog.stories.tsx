import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Dialog, DialogProps } from './Dialog';
import { Button, TextField, Box, Typography, Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Divider, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

export default {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Dialog - модальное окно для отображения важной информации или получения решения от пользователя.',
      },
    },
  },
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
      description: 'Максимальная ширина диалога',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Полноэкранный режим',
    },
    scroll: {
      control: 'radio',
      options: ['paper', 'body'],
      description: 'Способ прокрутки содержимого',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Показать кнопку закрытия в заголовке',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<DialogProps & { buttonText: string }> = ({ buttonText = 'Открыть диалог', ...args }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        {buttonText}
      </Button>
      <Dialog {...args} open={open} onClose={handleClose} />
    </>
  );
};

// Базовый диалог
export const Basic = Template.bind({});
Basic.args = {
  title: 'Заголовок диалога',
  description: 'Это базовый пример диалогового окна с текстовым описанием.',
  children: (
    <Typography variant="body2">
      Здесь может быть размещено любое содержимое диалога.
    </Typography>
  ),
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" onClick={() => {}}>OK</Button>
    </>
  ),
  buttonText: 'Открыть базовый диалог',
};

// Диалог подтверждения
export const Confirmation = Template.bind({});
Confirmation.args = {
  title: 'Подтверждение удаления',
  description: 'Вы уверены, что хотите удалить этот элемент? Это действие нельзя будет отменить.',
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => {}}>
        Удалить
      </Button>
    </>
  ),
  maxWidth: 'xs',
  buttonText: 'Удалить элемент',
};

// Диалог с формой
export const FormDialog = Template.bind({});
FormDialog.args = {
  title: 'Создать новый элемент',
  children: (
    <Stack spacing={2}>
      <TextField label="Название" fullWidth />
      <TextField label="Описание" fullWidth multiline rows={4} />
      <FormControl component="fieldset">
        <FormLabel component="legend">Категория</FormLabel>
        <RadioGroup defaultValue="a" row>
          <FormControlLabel value="a" control={<Radio />} label="Категория A" />
          <FormControlLabel value="b" control={<Radio />} label="Категория B" />
          <FormControlLabel value="c" control={<Radio />} label="Категория C" />
        </RadioGroup>
      </FormControl>
    </Stack>
  ),
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={() => {}}>
        Сохранить
      </Button>
    </>
  ),
  buttonText: 'Создать новый элемент',
};

// Полноэкранный диалог
export const FullScreenDialog = Template.bind({});
FullScreenDialog.args = {
  title: 'Редактирование профиля',
  fullScreen: true,
  children: (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Личная информация
      </Typography>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField label="Имя" fullWidth />
        <TextField label="Фамилия" fullWidth />
        <TextField label="Email" type="email" fullWidth />
      </Stack>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Настройки уведомлений
      </Typography>
      <FormControl component="fieldset">
        <Stack spacing={2}>
          <FormControlLabel control={<Radio />} label="Получать все уведомления" />
          <FormControlLabel control={<Radio />} label="Только важные уведомления" />
          <FormControlLabel control={<Radio />} label="Не получать уведомления" />
        </Stack>
      </FormControl>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Настройки приватности
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel control={<Radio />} label="Публичный профиль" />
        <FormControlLabel control={<Radio />} label="Приватный профиль" />
      </Stack>
    </Box>
  ),
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" onClick={() => {}}>Сохранить изменения</Button>
    </>
  ),
  buttonText: 'Редактировать профиль',
};

// Диалог с разными размерами
export const SizesExample = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('sm');

  const handleOpen = (newSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    setSize(newSize);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => handleOpen('xs')}>XS</Button>
        <Button variant="outlined" onClick={() => handleOpen('sm')}>SM</Button>
        <Button variant="outlined" onClick={() => handleOpen('md')}>MD</Button>
        <Button variant="outlined" onClick={() => handleOpen('lg')}>LG</Button>
        <Button variant="outlined" onClick={() => handleOpen('xl')}>XL</Button>
      </Stack>
      <Dialog
        open={open}
        onClose={handleClose}
        title={`Диалог размера ${size.toUpperCase()}`}
        description={`Это диалоговое окно с максимальной шириной ${size.toUpperCase()}`}
        maxWidth={size}
        actions={
          <>
            <Button onClick={handleClose}>Закрыть</Button>
          </>
        }
      >
        <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1">Содержимое диалога</Typography>
        </Box>
      </Dialog>
    </>
  );
};

// Практические примеры использования
export const Examples = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);

  return (
    <Stack spacing={4}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Диалог с информацией
        </Typography>
        <Button 
          startIcon={<InfoIcon />} 
          variant="outlined" 
          color="info"
          onClick={() => setInfoDialogOpen(true)}
        >
          Показать информацию
        </Button>
        <Dialog
          open={infoDialogOpen}
          onClose={() => setInfoDialogOpen(false)}
          title="Информация о приложении"
          maxWidth="sm"
          actions={
            <Button onClick={() => setInfoDialogOpen(false)}>Закрыть</Button>
          }
        >
          <Stack spacing={2}>
            <Typography variant="body1">
              Версия приложения: 1.2.3
            </Typography>
            <Typography variant="body1">
              Дата последнего обновления: 12.08.2023
            </Typography>
            <Typography variant="body1">
              Разработчик: ООО "Компания"
            </Typography>
          </Stack>
        </Dialog>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Диалог удаления
        </Typography>
        <Button 
          startIcon={<DeleteIcon />} 
          variant="outlined" 
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Удалить аккаунт
        </Button>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Удаление аккаунта"
          description="Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо и приведет к потере всех данных."
          maxWidth="xs"
          actions={
            <>
              <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Удалить
              </Button>
            </>
          }
        />
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Диалог предупреждения
        </Typography>
        <Button 
          startIcon={<WarningIcon />} 
          variant="outlined" 
          color="warning"
          onClick={() => setWarningDialogOpen(true)}
        >
          Предупреждение
        </Button>
        <Dialog
          open={warningDialogOpen}
          onClose={() => setWarningDialogOpen(false)}
          title="Предупреждение"
          description="У вас есть несохраненные изменения. Если вы покинете страницу, все изменения будут потеряны."
          maxWidth="sm"
          actions={
            <>
              <Button onClick={() => setWarningDialogOpen(false)}>Отмена</Button>
              <Button 
                variant="contained" 
                color="warning" 
                onClick={() => setWarningDialogOpen(false)}
              >
                Покинуть без сохранения
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setWarningDialogOpen(false)}
              >
                Сохранить и выйти
              </Button>
            </>
          }
        />
      </Paper>
    </Stack>
  );
};