import React, { useState } from 'react';
import {
  Typography,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Stack
} from '@mui/material';
import { 
  Person as PersonIcon
} from '@mui/icons-material';
import { deepOrange, deepPurple, green, pink, blue } from '@mui/material/colors';
import { SectionItem, ApiTable } from '../components';

// Интерактивный пример
const InteractiveAvatarDemo: React.FC = () => {
  const [variant, setVariant] = useState<'circular' | 'rounded' | 'square'>('circular');
  const [showBadge, setShowBadge] = useState(false);
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Выберите форму аватара:
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box 
            sx={{ 
              p: 1, 
              border: variant === 'circular' ? '2px solid' : '1px solid', 
              borderColor: variant === 'circular' ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={() => setVariant('circular')}
          >
            <Avatar variant="circular">АК</Avatar>
          </Box>
          
          <Box 
            sx={{ 
              p: 1, 
              border: variant === 'rounded' ? '2px solid' : '1px solid', 
              borderColor: variant === 'rounded' ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={() => setVariant('rounded')}
          >
            <Avatar variant="rounded">АК</Avatar>
          </Box>
          
          <Box 
            sx={{ 
              p: 1, 
              border: variant === 'square' ? '2px solid' : '1px solid', 
              borderColor: variant === 'square' ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={() => setVariant('square')}
          >
            <Avatar variant="square">АК</Avatar>
          </Box>
        </Stack>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Показать с бейджем:
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box 
            sx={{ 
              p: 1, 
              border: !showBadge ? '2px solid' : '1px solid', 
              borderColor: !showBadge ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={() => setShowBadge(false)}
          >
            <Avatar variant={variant}>АК</Avatar>
          </Box>
          
          <Box 
            sx={{ 
              p: 1, 
              border: showBadge ? '2px solid' : '1px solid', 
              borderColor: showBadge ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={() => setShowBadge(true)}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Avatar
                  sx={{ width: 16, height: 16, bgcolor: 'success.main' }}
                  alt="Статус"
                >
                  <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                </Avatar>
              }
            >
              <Avatar variant={variant}>АК</Avatar>
            </Badge>
          </Box>
        </Stack>
      </Box>
      
      <Box>
        <Typography variant="body2" gutterBottom>
          Результат:
        </Typography>
        {showBadge ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar
                sx={{ width: 22, height: 22, bgcolor: 'success.main' }}
                alt="Статус"
              >
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
              </Avatar>
            }
          >
            <Avatar
              variant={variant}
              sx={{ width: 56, height: 56, bgcolor: deepPurple[500] }}
            >
              АК
            </Avatar>
          </Badge>
        ) : (
          <Avatar
            variant={variant}
            sx={{ width: 56, height: 56, bgcolor: deepPurple[500] }}
          >
            АК
          </Avatar>
        )}
      </Box>
    </Box>
  );
};

const AvatarSection: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>Аватары</Typography>
      <Typography variant="body2" paragraph>
        Аватары используются для представления пользователей или объектов. Они могут отображать изображения, 
        иконки или текст.
      </Typography>
      
      {/* 1. Базовое использование */}
      <SectionItem title="Базовое использование">
        <Stack direction="row" spacing={2}>
          <Avatar>АК</Avatar>
          <Avatar src="https://mui.com/static/images/avatar/1.jpg" alt="Пользователь" />
          <Avatar><PersonIcon /></Avatar>
        </Stack>
      </SectionItem>
      
      {/* 2. Варианты и состояния */}
      <SectionItem 
        title="Варианты" 
        description="Аватары могут иметь разные формы и цвета"
      >
        <Typography variant="body2" gutterBottom>
          Различные формы:
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Avatar variant="circular">АК</Avatar>
          <Avatar variant="rounded">АК</Avatar>
          <Avatar variant="square">АК</Avatar>
        </Stack>
        
        <Typography variant="body2" gutterBottom>
          Различные цвета:
        </Typography>
        <Stack direction="row" spacing={2}>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>АК</Avatar>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>ИИ</Avatar>
          <Avatar sx={{ bgcolor: pink[500] }}>МС</Avatar>
          <Avatar sx={{ bgcolor: green[500] }}>ОП</Avatar>
          <Avatar sx={{ bgcolor: blue[500] }}>ТШ</Avatar>
        </Stack>
      </SectionItem>
      
      {/* 3. Интерактивный пример */}
      <SectionItem 
        title="Интерактивный пример" 
        description="Выберите форму аватара и другие параметры"
      >
        <InteractiveAvatarDemo />
      </SectionItem>
      
      {/* 4. Комбинированное использование */}
      <SectionItem title="С другими компонентами">
        <Typography variant="body2" gutterBottom>
          Аватары с бейджами:
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar sx={{ width: 16, height: 16, bgcolor: 'success.main' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
              </Avatar>
            }
          >
            <Avatar>АК</Avatar>
          </Badge>
          
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent="+"
            color="primary"
          >
            <Avatar>ИИ</Avatar>
          </Badge>
        </Stack>
        
        <Typography variant="body2" gutterBottom>
          Группы аватаров:
        </Typography>
        <AvatarGroup max={4}>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>АК</Avatar>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>ИИ</Avatar>
          <Avatar sx={{ bgcolor: pink[500] }}>МС</Avatar>
          <Avatar sx={{ bgcolor: green[500] }}>ОП</Avatar>
          <Avatar sx={{ bgcolor: blue[500] }}>ТШ</Avatar>
        </AvatarGroup>
      </SectionItem>
      
      {/* 5. Адаптивность */}
      <SectionItem title="Адаптивность">
        <Typography variant="body2" gutterBottom>
          Аватары различных размеров:
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 24, height: 24 }}>XS</Avatar>
          <Avatar sx={{ width: 32, height: 32 }}>S</Avatar>
          <Avatar>M</Avatar>
          <Avatar sx={{ width: 56, height: 56 }}>L</Avatar>
          <Avatar sx={{ width: 64, height: 64 }}>XL</Avatar>
        </Stack>
      </SectionItem>
      
      {/* 6. API документация */}
      <SectionItem title="API">
        <ApiTable 
          props={[
            { name: 'alt', type: 'string', description: 'Альтернативный текст для аватара с изображением' },
            { name: 'children', type: 'node', description: 'Содержимое аватара (текст или иконка)' },
            { name: 'src', type: 'string', description: 'URL изображения для аватара' },
            { name: 'srcSet', type: 'string', description: 'srcSet для изображения' },
            { name: 'variant', type: "'circular' | 'rounded' | 'square'", default: "'circular'", description: 'Форма аватара' },
            { name: 'sx', type: 'object', description: 'Объект стилей для кастомизации' }
          ]} 
        />
      </SectionItem>
    </>
  );
};

export default AvatarSection;