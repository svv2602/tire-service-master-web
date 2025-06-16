import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Accordion, AccordionProps } from './Accordion';
import { 
  Box, 
  Typography, 
  Stack, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Link,
  Radio
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FeedbackIcon from '@mui/icons-material/Feedback';

export default {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Accordion - раскрывающаяся панель для группировки и скрытия содержимого.',
      },
    },
  },
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: 'Открыт ли аккордеон по умолчанию',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключен ли аккордеон',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<AccordionProps> = (args) => <Accordion {...args} />;

// Базовый аккордеон
export const Basic = Template.bind({});
Basic.args = {
  title: 'Заголовок аккордеона',
  children: (
    <Typography>
      Содержимое аккордеона с текстом. Аккордеоны позволяют скрывать и показывать содержимое
      по клику на заголовок, что помогает экономить место на странице и улучшает восприятие информации.
    </Typography>
  ),
  defaultExpanded: false,
};

// Аккордеон с кастомным заголовком
export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
      <Typography variant="subtitle1" color="primary.main">
        Важная информация
      </Typography>
    </Box>
  ),
  children: (
    <Typography>
      Аккордеон с кастомным заголовком, который может содержать иконки, 
      форматированный текст и другие элементы.
    </Typography>
  ),
};

// Аккордеон с кастомной иконкой
export const CustomIcon = Template.bind({});
CustomIcon.args = {
  title: 'Аккордеон с кастомной иконкой',
  expandIcon: <KeyboardArrowRightIcon />,
  children: (
    <Typography>
      В этом аккордеоне используется иконка KeyboardArrowRightIcon вместо стандартной ExpandMoreIcon.
      Иконка поворачивается при открытии аккордеона.
    </Typography>
  ),
};

// Отключенный аккордеон
export const Disabled = Template.bind({});
Disabled.args = {
  title: 'Отключенный аккордеон',
  disabled: true,
  children: (
    <Typography>
      Этот аккордеон отключен и не может быть открыт пользователем.
    </Typography>
  ),
};

// Группа аккордеонов
export const AccordionGroup = () => (
  <Stack spacing={1}>
    <Accordion title="Раздел 1">
      <Typography>
        Содержимое первого раздела. Здесь может быть размещена любая информация,
        относящаяся к данному разделу.
      </Typography>
    </Accordion>
    <Accordion title="Раздел 2">
      <Typography>
        Содержимое второго раздела. Каждый аккордеон в группе может быть открыт
        независимо от других.
      </Typography>
    </Accordion>
    <Accordion title="Раздел 3">
      <Typography>
        Содержимое третьего раздела. Аккордеоны часто используются для создания FAQ,
        настроек и других разделов, где нужно компактно представить много информации.
      </Typography>
    </Accordion>
  </Stack>
);

// Контролируемые аккордеоны (только один открыт одновременно)
export const ControlledAccordions = () => {
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Stack spacing={1}>
      <Accordion 
        title="Раздел 1" 
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <Typography>
          Содержимое первого раздела. При открытии этого аккордеона, 
          другие аккордеоны автоматически закрываются.
        </Typography>
      </Accordion>
      <Accordion 
        title="Раздел 2" 
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
      >
        <Typography>
          Содержимое второго раздела. Такой подход обеспечивает, что только
          один аккордеон может быть открыт одновременно.
        </Typography>
      </Accordion>
      <Accordion 
        title="Раздел 3" 
        expanded={expanded === 'panel3'}
        onChange={handleChange('panel3')}
      >
        <Typography>
          Содержимое третьего раздела. Это помогает пользователю сфокусироваться
          на одном разделе информации за раз.
        </Typography>
      </Accordion>
    </Stack>
  );
};

// Аккордеон с формой
export const FormAccordion = () => (
  <Accordion 
    title="Контактная информация" 
    defaultExpanded
  >
    <Stack spacing={2}>
      <TextField label="Имя" fullWidth />
      <TextField label="Email" type="email" fullWidth />
      <TextField label="Сообщение" multiline rows={4} fullWidth />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained">Отправить</Button>
      </Box>
    </Stack>
  </Accordion>
);

// Аккордеон со списком
export const ListAccordion = () => (
  <Accordion 
    title="Список элементов" 
    defaultExpanded
  >
    <List disablePadding>
      {['Элемент 1', 'Элемент 2', 'Элемент 3', 'Элемент 4', 'Элемент 5'].map((item, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemText primary={item} />
          </ListItem>
          {index < 4 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  </Accordion>
);

// Вложенные аккордеоны
export const NestedAccordions = () => (
  <Accordion title="Основной раздел" defaultExpanded>
    <Typography paragraph>
      Основное содержимое раздела, которое видно при раскрытии.
    </Typography>
    <Stack spacing={1}>
      <Accordion title="Подраздел 1">
        <Typography>
          Содержимое первого подраздела. Вложенные аккордеоны позволяют
          создавать иерархическую структуру информации.
        </Typography>
      </Accordion>
      <Accordion title="Подраздел 2">
        <Typography paragraph>
          Содержимое второго подраздела.
        </Typography>
        <Accordion title="Вложенный подраздел">
          <Typography>
            Еще более глубокий уровень вложенности. Такая структура
            может использоваться для создания сложных меню настроек или FAQ.
          </Typography>
        </Accordion>
      </Accordion>
    </Stack>
  </Accordion>
);

// Практические примеры использования
export const Examples = () => (
  <Stack spacing={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        FAQ (Часто задаваемые вопросы)
      </Typography>
      <Stack spacing={1}>
        <Accordion 
          title="Как создать аккаунт?"
          expandIcon={<HelpIcon />}
        >
          <Typography>
            Для создания аккаунта нажмите кнопку "Регистрация" в правом верхнем углу экрана.
            Заполните необходимые поля формы и подтвердите свой email. После этого вы сможете
            войти в систему, используя свои учетные данные.
          </Typography>
        </Accordion>
        <Accordion 
          title="Как восстановить пароль?"
          expandIcon={<HelpIcon />}
        >
          <Typography>
            Если вы забыли пароль, нажмите на ссылку "Забыли пароль?" на странице входа.
            Введите email, указанный при регистрации, и следуйте инструкциям, которые
            будут отправлены на вашу почту.
          </Typography>
        </Accordion>
        <Accordion 
          title="Как изменить настройки профиля?"
          expandIcon={<HelpIcon />}
        >
          <Typography>
            Чтобы изменить настройки профиля, войдите в систему и нажмите на свое имя
            в правом верхнем углу. В выпадающем меню выберите "Настройки профиля".
            Здесь вы сможете изменить личную информацию, пароль и настройки уведомлений.
          </Typography>
        </Accordion>
      </Stack>
    </Paper>
    
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Настройки приложения
      </Typography>
      <Stack spacing={1}>
        <Accordion 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              <Typography>Настройки профиля</Typography>
            </Box>
          }
        >
          <Stack spacing={2}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Публичный профиль" 
            />
            <FormControlLabel 
              control={<Switch />} 
              label="Показывать email" 
            />
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Получать уведомления" 
            />
            <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
              Изменить пароль
            </Button>
          </Stack>
        </Accordion>
        <Accordion 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              <Typography>Общие настройки</Typography>
            </Box>
          }
        >
          <Stack spacing={2}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Темная тема" 
            />
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Уведомления на email" 
            />
            <FormControlLabel 
              control={<Switch />} 
              label="Push-уведомления" 
            />
          </Stack>
        </Accordion>
      </Stack>
    </Paper>
    
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Процесс оформления заказа
      </Typography>
      <Stack spacing={1}>
        <Accordion 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ mr: 1 }} />
                <Typography>Корзина</Typography>
              </Box>
              <Chip label="Шаг 1" color="primary" size="small" />
            </Box>
          }
          defaultExpanded
        >
          <List disablePadding>
            {[
              { name: 'Товар 1', price: '1 200 ₽', quantity: 1 },
              { name: 'Товар 2', price: '2 500 ₽', quantity: 2 },
              { name: 'Товар 3', price: '800 ₽', quantity: 1 },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={item.name} 
                    secondary={`${item.quantity} шт.`} 
                  />
                  <Typography>{item.price}</Typography>
                </ListItem>
                {index < 2 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="subtitle2">Итого:</Typography>
            <Typography variant="subtitle1">5 000 ₽</Typography>
          </Box>
        </Accordion>
        
        <Accordion 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography>Оплата</Typography>
              </Box>
              <Chip label="Шаг 2" color="primary" size="small" />
            </Box>
          }
        >
          <Stack spacing={2}>
            <Typography variant="body2">
              Выберите способ оплаты:
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel 
                control={<Radio checked />} 
                label="Банковская карта" 
              />
              <FormControlLabel 
                control={<Radio />} 
                label="Электронный кошелек" 
              />
              <FormControlLabel 
                control={<Radio />} 
                label="Наличными при получении" 
              />
            </Stack>
            <TextField 
              label="Номер карты" 
              placeholder="XXXX XXXX XXXX XXXX" 
              fullWidth 
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Срок действия" 
                placeholder="MM/YY" 
                sx={{ width: '50%' }} 
              />
              <TextField 
                label="CVV" 
                type="password" 
                sx={{ width: '50%' }} 
              />
            </Box>
          </Stack>
        </Accordion>
        
        <Accordion 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShippingIcon sx={{ mr: 1 }} />
                <Typography>Доставка</Typography>
              </Box>
              <Chip label="Шаг 3" color="primary" size="small" />
            </Box>
          }
        >
          <Stack spacing={2}>
            <Typography variant="body2">
              Выберите способ доставки:
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel 
                control={<Radio checked />} 
                label="Курьерская доставка" 
              />
              <FormControlLabel 
                control={<Radio />} 
                label="Самовывоз из пункта выдачи" 
              />
              <FormControlLabel 
                control={<Radio />} 
                label="Почтовая доставка" 
              />
            </Stack>
            <TextField 
              label="Адрес доставки" 
              fullWidth 
              multiline
              rows={2}
            />
            <TextField 
              label="Комментарий к заказу" 
              fullWidth 
              multiline
              rows={2}
            />
          </Stack>
        </Accordion>
      </Stack>
    </Paper>
  </Stack>
);