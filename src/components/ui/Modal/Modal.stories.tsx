import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Modal, ModalProps } from './Modal';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Stack, 
  FormControlLabel, 
  Checkbox, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Modal - модальное окно для отображения содержимого поверх основного интерфейса.',
      },
    },
  },
  argTypes: {
    width: {
      control: 'text',
      description: 'Ширина модального окна',
    },
    height: {
      control: 'text',
      description: 'Высота модального окна',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Показать кнопку закрытия в заголовке',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<ModalProps & { buttonText: string }> = ({ buttonText = 'Открыть модальное окно', ...args }) => {
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
      <Modal {...args} open={open} onClose={handleClose} />
    </>
  );
};

// Базовое модальное окно
export const Basic = Template.bind({});
Basic.args = {
  title: 'Заголовок модального окна',
  children: (
    <Typography variant="body1">
      Это базовый пример модального окна с текстовым содержимым.
      Модальные окна используются для отображения содержимого поверх основного интерфейса.
    </Typography>
  ),
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" onClick={() => {}}>OK</Button>
    </>
  ),
  buttonText: 'Открыть базовое модальное окно',
  width: 500,
};

// Модальное окно с формой
export const FormModal = Template.bind({});
FormModal.args = {
  title: 'Редактирование профиля',
  children: (
    <Stack spacing={2}>
      <TextField label="Имя" fullWidth />
      <TextField label="Фамилия" fullWidth />
      <TextField label="Email" type="email" fullWidth />
      <TextField label="Телефон" fullWidth />
      <FormControlLabel 
        control={<Checkbox defaultChecked />} 
        label="Получать уведомления по email" 
      />
    </Stack>
  ),
  actions: (
    <>
      <Button onClick={() => {}}>Отмена</Button>
      <Button variant="contained" color="primary" onClick={() => {}}>
        Сохранить
      </Button>
    </>
  ),
  buttonText: 'Редактировать профиль',
  width: 400,
};

// Модальное окно с изображением
export const ImageModal = Template.bind({});
ImageModal.args = {
  title: 'Просмотр изображения',
  children: (
    <Box sx={{ textAlign: 'center' }}>
      <img 
        src="https://source.unsplash.com/random/800x600/?nature" 
        alt="Случайное изображение" 
        style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
      />
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Случайное изображение природы
      </Typography>
    </Box>
  ),
  actions: (
    <Button onClick={() => {}}>Закрыть</Button>
  ),
  buttonText: 'Просмотреть изображение',
  width: 800,
};

// Модальное окно с различными размерами
export const SizesExample = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<{ width: number | string, height: number | string }>({ width: 500, height: 'auto' });

  const handleOpen = (newSize: { width: number | string, height: number | string }) => {
    setSize(newSize);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button variant="outlined" onClick={() => handleOpen({ width: 300, height: 'auto' })}>
          Маленькое
        </Button>
        <Button variant="outlined" onClick={() => handleOpen({ width: 500, height: 'auto' })}>
          Среднее
        </Button>
        <Button variant="outlined" onClick={() => handleOpen({ width: 800, height: 'auto' })}>
          Большое
        </Button>
        <Button variant="outlined" onClick={() => handleOpen({ width: '80%', height: '80%' })}>
          Процентное
        </Button>
        <Button variant="outlined" onClick={() => handleOpen({ width: 500, height: 500 })}>
          Квадратное
        </Button>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        title={`Модальное окно ${typeof size.width === 'number' ? size.width + 'px' : size.width} × ${size.height}`}
        width={size.width}
        height={size.height}
        actions={
          <Button onClick={handleClose}>Закрыть</Button>
        }
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="body1">
            Размер: {typeof size.width === 'number' ? size.width + 'px' : size.width} × {size.height}
          </Typography>
          <Box sx={{ 
            width: '50%', 
            height: '50%', 
            bgcolor: 'primary.light', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1
          }}>
            <Typography variant="body2" color="primary.contrastText">
              Содержимое
            </Typography>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

// Практические примеры использования
export const Examples = () => {
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [fileExplorerOpen, setFileExplorerOpen] = useState(false);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);

  return (
    <Stack spacing={4}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Профиль пользователя
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => setUserProfileOpen(true)}
        >
          Просмотреть профиль
        </Button>
        <Modal
          open={userProfileOpen}
          onClose={() => setUserProfileOpen(false)}
          title="Профиль пользователя"
          width={600}
          actions={
            <Button onClick={() => setUserProfileOpen(false)}>Закрыть</Button>
          }
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Box sx={{ 
              width: { xs: '100%', sm: 200 }, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Box 
                sx={{ 
                  width: 150, 
                  height: 150, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h3" color="primary.contrastText">ИП</Typography>
              </Box>
              <Typography variant="subtitle1">Иван Петров</Typography>
              <Typography variant="body2" color="text.secondary">Менеджер</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Полное имя" 
                    secondary="Иван Петрович Петров" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary="ivan.petrov@example.com" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Телефон" 
                    secondary="+7 (123) 456-78-90" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Адрес" 
                    secondary="г. Москва, ул. Примерная, д. 123" 
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Modal>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Проводник файлов
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => setFileExplorerOpen(true)}
        >
          Открыть проводник
        </Button>
        <Modal
          open={fileExplorerOpen}
          onClose={() => setFileExplorerOpen(false)}
          title="Выберите файл"
          width={700}
          height={500}
          actions={
            <>
              <Button onClick={() => setFileExplorerOpen(false)}>Отмена</Button>
              <Button 
                variant="contained" 
                onClick={() => setFileExplorerOpen(false)}
              >
                Выбрать
              </Button>
            </>
          }
        >
          <Grid container spacing={2}>
            {[
              { name: 'image1.jpg', type: 'image', size: '1.2 MB', date: '12.08.2023' },
              { name: 'document.pdf', type: 'document', size: '2.5 MB', date: '10.08.2023' },
              { name: 'video.mp4', type: 'video', size: '15.7 MB', date: '05.08.2023' },
              { name: 'presentation.pptx', type: 'document', size: '5.3 MB', date: '01.08.2023' },
              { name: 'image2.png', type: 'image', size: '0.8 MB', date: '28.07.2023' },
              { name: 'notes.txt', type: 'document', size: '0.1 MB', date: '25.07.2023' },
            ].map((file, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 100,
                    mb: 1
                  }}>
                    {file.type === 'image' && <ImageIcon sx={{ fontSize: 40 }} color="primary" />}
                    {file.type === 'video' && <VideocamIcon sx={{ fontSize: 40 }} color="secondary" />}
                    {file.type === 'document' && <InsertDriveFileIcon sx={{ fontSize: 40 }} color="info" />}
                  </Box>
                  <Typography variant="body2" noWrap>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{file.size}</Typography>
                  <Typography variant="caption" color="text.secondary">{file.date}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Modal>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Детали продукта
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => setProductDetailsOpen(true)}
        >
          Просмотреть детали
        </Button>
        <Modal
          open={productDetailsOpen}
          onClose={() => setProductDetailsOpen(false)}
          title="Детали продукта"
          width={800}
          actions={
            <Button onClick={() => setProductDetailsOpen(false)}>Закрыть</Button>
          }
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 350 } }}>
              <img 
                src="https://source.unsplash.com/random/400x300/?product" 
                alt="Продукт" 
                style={{ width: '100%', borderRadius: 8 }} 
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom>Премиум продукт</Typography>
              <Typography variant="h6" color="primary" gutterBottom>12 500 ₽</Typography>
              
              <Typography variant="body1" paragraph>
                Описание продукта с подробной информацией о характеристиках, 
                материалах и преимуществах. Этот продукт отличается высоким 
                качеством и надежностью.
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Характеристики:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">• Материал: Премиум</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">• Вес: 1.2 кг</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">• Размеры: 30x20x10 см</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">• Цвет: Черный</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" fullWidth>
                  Добавить в корзину
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Paper>
    </Stack>
  );
};