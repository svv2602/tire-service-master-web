import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card as MuiCard,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  CardHeader,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { red } from '@mui/material/colors';
import { Card } from '../../../../components/ui/Card';

export const CardSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Card
      </Typography>

      <Card title="Примеры карточек">
        <Grid container spacing={4}>
          {/* Базовая карточка */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Базовая карточка</Typography>
            <MuiCard>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Заголовок карточки
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Это пример простой карточки с текстовым содержимым. Карточки могут содержать
                  текст, изображения и различные действия.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Подробнее</Button>
                <Button size="small">Поделиться</Button>
              </CardActions>
            </MuiCard>
          </Grid>

          {/* Карточка с медиа-контентом */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Карточка с изображением</Typography>
            <MuiCard>
              <CardMedia
                component="img"
                height="194"
                image="https://source.unsplash.com/random/400x200/?tire"
                alt="Шины"
              />
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Летние шины
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Широкий выбор летних шин для вашего автомобиля. Гарантия качества и
                  профессиональная установка.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Купить</Button>
                <Button size="small">Подробнее</Button>
              </CardActions>
            </MuiCard>
          </Grid>

          {/* Сложная карточка */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Сложная карточка</Typography>
            <MuiCard>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                    R
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title="Сервисное обслуживание"
                subheader="14 марта 2024"
              />
              <CardMedia
                component="img"
                height="194"
                image="https://source.unsplash.com/random/400x200/?car,service"
                alt="Автосервис"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Профессиональное обслуживание вашего автомобиля. Замена шин, балансировка,
                  ремонт и другие услуги в нашем автосервисе.
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="добавить в избранное">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="поделиться">
                  <ShareIcon />
                </IconButton>
                <Button size="small" sx={{ marginLeft: 'auto' }}>
                  Записаться
                </Button>
              </CardActions>
            </MuiCard>
          </Grid>

          {/* Карточка с действиями */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Карточка с действиями</Typography>
            <MuiCard>
              <CardHeader
                title="Акция"
                subheader="Действует до 31 марта 2024"
              />
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  Скидка 20% на все услуги
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  При покупке комплекта шин получите скидку 20% на шиномонтаж и балансировку.
                  Акция распространяется на все виды шин.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Участвовать
                </Button>
                <Button size="small" color="secondary">
                  Подробные условия
                </Button>
              </CardActions>
            </MuiCard>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default CardSection;