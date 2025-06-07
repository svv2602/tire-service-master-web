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
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Button as CustomButton } from '../../components/ui/Button';

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
    </Container>
  );
};

export default StyleGuidePage; 