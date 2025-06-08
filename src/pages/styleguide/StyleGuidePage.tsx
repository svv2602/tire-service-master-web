import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Tab,
  Tabs,
  Alert,
  Badge,
  Tooltip,
  Skeleton,
  Paper,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  IconButton,
  Drawer,
  Rating,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Button as CustomButton } from '../../components/ui/Button';
import { Backdrop } from '../../components/ui/Backdrop';
import { Slider } from '../../components/ui/Slider';
import { TimePicker } from '../../components/ui/TimePicker';
import { DatePicker } from '../../components/ui/DatePicker';
import AutoComplete from '../../components/ui/AutoComplete';
import FileUpload from '../../components/ui/FileUpload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InboxIcon from '@mui/icons-material/Inbox';
import MailIcon from '@mui/icons-material/Mail';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Стилизованный компонент для секции
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box mb={4}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

// Стилизованный компонент для демонстрации цветов
const ColorBox = styled(Box)<{ bgcolor: string }>(({ theme, bgcolor }) => ({
  width: 100,
  height: 100,
  backgroundColor: bgcolor,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.getContrastText(bgcolor),
  marginBottom: theme.spacing(1)
}));

const StyleGuidePage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState<Date | null>(null);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>
        Style Guide
      </Typography>

      {/* Типография */}
      <Section title="Типография">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h1">H1 Заголовок</Typography>
            <Typography variant="h2">H2 Заголовок</Typography>
            <Typography variant="h3">H3 Заголовок</Typography>
            <Typography variant="h4">H4 Заголовок</Typography>
            <Typography variant="h5">H5 Заголовок</Typography>
            <Typography variant="h6">H6 Заголовок</Typography>
            <Typography variant="body1">Body 1. Lorem ipsum dolor sit amet</Typography>
            <Typography variant="body2">Body 2. Lorem ipsum dolor sit amet</Typography>
            <Typography variant="subtitle1">Subtitle 1. Lorem ipsum dolor sit amet</Typography>
            <Typography variant="subtitle2">Subtitle 2. Lorem ipsum dolor sit amet</Typography>
          </Grid>
        </Grid>
      </Section>

      {/* Кнопки */}
      <Section title="Кнопки">
        <Grid container spacing={2}>
          <Grid item><CustomButton variant="primary">Primary Button</CustomButton></Grid>
          <Grid item><CustomButton variant="secondary">Secondary Button</CustomButton></Grid>
          <Grid item><CustomButton variant="success">Success Button</CustomButton></Grid>
          <Grid item><CustomButton variant="error">Error Button</CustomButton></Grid>
          <Grid item><CustomButton variant="primary" loading>Loading Button</CustomButton></Grid>
        </Grid>
      </Section>

      {/* Текстовые поля */}
      <Section title="Текстовые поля">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Стандартное" fullWidth margin="normal" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="С ошибкой" error helperText="Текст ошибки" fullWidth margin="normal" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Отключенное" disabled fullWidth margin="normal" />
          </Grid>
        </Grid>
      </Section>

      {/* Карточки */}
      <Section title="Карточки">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">Заголовок карточки</Typography>
                <Typography variant="body2">
                  Содержимое карточки с каким-то текстом для примера.
                </Typography>
              </CardContent>
              <CardActions>
                <CustomButton size="small">Действие 1</CustomButton>
                <CustomButton size="small">Действие 2</CustomButton>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Section>

      {/* Вкладки */}
      <Section title="Вкладки">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Вкладка 1" />
            <Tab label="Вкладка 2" />
            <Tab label="Вкладка 3" />
          </Tabs>
        </Box>
        <Box>
          {tabValue === 0 && <Typography>Содержимое вкладки 1</Typography>}
          {tabValue === 1 && <Typography>Содержимое вкладки 2</Typography>}
          {tabValue === 2 && <Typography>Содержимое вкладки 3</Typography>}
        </Box>
      </Section>

      {/* Уведомления */}
      <Section title="Уведомления">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Alert severity="success" sx={{ mb: 2 }}>Успешное действие</Alert>
            <Alert severity="info" sx={{ mb: 2 }}>Информационное сообщение</Alert>
            <Alert severity="warning" sx={{ mb: 2 }}>Предупреждение</Alert>
            <Alert severity="error">Ошибка</Alert>
          </Grid>
        </Grid>
      </Section>

      {/* Бейджи */}
      <Section title="Бейджи">
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Badge badgeContent={4} color="primary">
              <CustomButton variant="contained">Уведомления</CustomButton>
            </Badge>
          </Grid>
          <Grid item>
            <Badge badgeContent={99} color="secondary" max={99}>
              <CustomButton variant="contained">Максимум 99</CustomButton>
            </Badge>
          </Grid>
        </Grid>
      </Section>

      {/* Тултипы */}
      <Section title="Тултипы">
        <Grid container spacing={3}>
          <Grid item>
            <Tooltip title="Подсказка сверху" arrow>
              <CustomButton variant="outlined">Наведите</CustomButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Подсказка снизу" arrow placement="bottom">
              <CustomButton variant="outlined">Снизу</CustomButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Section>

      {/* Скелетоны */}
      <Section title="Скелетоны">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" height={118} />
          </Grid>
        </Grid>
      </Section>

      {/* Цвета */}
      <Section title="Цвета">
        <Grid container spacing={2}>
          <Grid item>
            <ColorBox bgcolor={theme.palette.primary.main}>Primary</ColorBox>
            <Typography variant="caption">Primary</Typography>
          </Grid>
          <Grid item>
            <ColorBox bgcolor={theme.palette.secondary.main}>Secondary</ColorBox>
            <Typography variant="caption">Secondary</Typography>
          </Grid>
          <Grid item>
            <ColorBox bgcolor={theme.palette.error.main}>Error</ColorBox>
            <Typography variant="caption">Error</Typography>
          </Grid>
          <Grid item>
            <ColorBox bgcolor={theme.palette.warning.main}>Warning</ColorBox>
            <Typography variant="caption">Warning</Typography>
          </Grid>
          <Grid item>
            <ColorBox bgcolor={theme.palette.info.main}>Info</ColorBox>
            <Typography variant="caption">Info</Typography>
          </Grid>
          <Grid item>
            <ColorBox bgcolor={theme.palette.success.main}>Success</ColorBox>
            <Typography variant="caption">Success</Typography>
          </Grid>
        </Grid>
      </Section>

      {/* Backdrop */}
      <Section title="Backdrop">
        <Grid container spacing={2}>
          <Grid item>
            <CustomButton onClick={() => setBackdropOpen(true)}>
              Открыть Backdrop
            </CustomButton>
            <Backdrop open={backdropOpen} onClose={() => setBackdropOpen(false)} loading />
          </Grid>
        </Grid>
      </Section>

      {/* Slider */}
      <Section title="Slider">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Slider
              value={50}
              onChange={() => {}}
              showMarks
              step={10}
              marks={[
                { value: 0, label: '0°C' },
                { value: 50, label: '50°C' },
                { value: 100, label: '100°C' },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Slider
              value={[20, 80]}
              onChange={() => {}}
              showValue
              valueFormatter={(value) => `${value}%`}
            />
          </Grid>
        </Grid>
      </Section>

      {/* TimePicker и DatePicker */}
      <Section title="Выбор даты и времени">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TimePicker
              label="Выберите время"
              value={time}
              onChange={(newTime) => setTime(newTime)}
              showSeconds
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Выберите дату"
              value={date}
              onChange={(newDate) => setDate(newDate)}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Accordion */}
      <Section title="Accordion">
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Секция 1</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Содержимое первой секции аккордеона.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Секция 2</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Содержимое второй секции аккордеона.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Section>

      {/* Stepper */}
      <Section title="Stepper">
        <Stepper activeStep={1}>
          <Step>
            <StepLabel>Шаг 1</StepLabel>
          </Step>
          <Step>
            <StepLabel>Шаг 2</StepLabel>
          </Step>
          <Step>
            <StepLabel>Шаг 3</StepLabel>
          </Step>
        </Stepper>
      </Section>

      {/* Menu */}
      <Section title="Menu">
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => setMenuAnchor(null)}>Профиль</MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>Настройки</MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>Выход</MenuItem>
        </Menu>
      </Section>

      {/* Drawer */}
      <Section title="Drawer">
        <CustomButton onClick={() => setDrawerOpen(true)}>
          Открыть Drawer
        </CustomButton>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 250 }}>
            <List>
              <ListItem button>
                <ListItemIcon><InboxIcon /></ListItemIcon>
                <ListItemText primary="Входящие" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><MailIcon /></ListItemIcon>
                <ListItemText primary="Почта" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Section>

      {/* AutoComplete */}
      <Section title="AutoComplete">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <AutoComplete
              options={['JavaScript', 'TypeScript', 'React', 'Vue', 'Angular']}
              label="Выберите технологию"
            />
          </Grid>
        </Grid>
      </Section>

      {/* FileUpload */}
      <Section title="FileUpload">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FileUpload
              onUpload={() => {}}
              accept="image/*"
              maxSize={5000000}
              label="Загрузить изображение"
            />
          </Grid>
        </Grid>
      </Section>

      {/* Rating */}
      <Section title="Rating">
        <Grid container spacing={2}>
          <Grid item>
            <Rating value={3.5} precision={0.5} />
          </Grid>
          <Grid item>
            <Rating value={4} readOnly />
          </Grid>
        </Grid>
      </Section>

      {/* SpeedDial */}
      <Section title="SpeedDial">
        <Box sx={{ position: 'relative', height: 100 }}>
          <SpeedDial
            ariaLabel="SpeedDial example"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Создать"
            />
            <SpeedDialAction
              icon={<EditIcon />}
              tooltipTitle="Редактировать"
            />
            <SpeedDialAction
              icon={<DeleteIcon />}
              tooltipTitle="Удалить"
            />
          </SpeedDial>
        </Box>
      </Section>

      {/* Checkbox, Radio, Switch */}
      <Section title="Элементы формы">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Checkbox"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RadioGroup defaultValue="1">
              <FormControlLabel
                value="1"
                control={<Radio />}
                label="Radio 1"
              />
              <FormControlLabel
                value="2"
                control={<Radio />}
                label="Radio 2"
              />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Switch"
            />
          </Grid>
        </Grid>
      </Section>

      {/* Select */}
      <Section title="Select">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Выберите опцию</InputLabel>
              <Select
                value=""
                label="Выберите опцию"
              >
                <MenuItem value={10}>Опция 1</MenuItem>
                <MenuItem value={20}>Опция 2</MenuItem>
                <MenuItem value={30}>Опция 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Section>
    </Container>
  );
};

export default StyleGuidePage; 