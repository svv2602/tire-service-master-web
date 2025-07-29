import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon
} from '@mui/icons-material';
// import QRCode from 'qrcode'; // Временно отключено
import { getThemeColors } from '../../styles';
import { useGetPageContentsQuery } from '../../api/pageContent.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';

interface ClientFooterProps {
  botUsername?: string;
}

export const ClientFooter: React.FC<ClientFooterProps> = ({ 
  botUsername = 'tire_service_ua_bot' 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  // QR код заменен на простую ссылку

  // API запрос для контента футера
  const { data: pageContentData } = useGetPageContentsQuery({
    section: 'client_main'
  });

  // API запрос для категорий услуг
  const { data: categoriesData } = useGetServiceCategoriesQuery({
    active: true,
    per_page: 6
  });

  const pageContent = pageContentData?.data || [];
  const footerContent = pageContent.find(item => 
    item.content_type === 'text_block' && item.settings?.type === 'footer'
  );

  const serviceCategories = categoriesData?.data || [];

  // Генерация QR кода
  // Функция не используется - QR код заменен на прямую ссылку
  const generateQRCode = async () => {
    // Функциональность отключена
  };

  const handleTelegramClick = () => {
    // Простое перенаправление на Telegram бота вместо QR кода
    const botUrl = `https://t.me/${botUsername}`;
    window.open(botUrl, '_blank');
  };

  return (
    <>
      <Box sx={{ 
        bgcolor: colors.backgroundCard, 
        py: 4, 
        borderTop: `1px solid ${colors.borderPrimary}`,
        mt: 'auto' // Прижимаем футер к низу
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
                🚗 Твоя Шина
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                Знайдіть найкращий автосервіс поруч з вами. Швидке бронювання, перевірені майстри.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" sx={{ color: colors.textSecondary }}>
                  <PhoneIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: colors.textSecondary }}>
                  <EmailIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={handleTelegramClick}
                  sx={{ 
                    color: '#0088cc',
                    '&:hover': {
                      bgcolor: 'rgba(0, 136, 204, 0.1)'
                    }
                  }}
                  title="Підписатися на Telegram бота"
                >
                  <TelegramIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Послуги
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(serviceCategories.length > 0 ? serviceCategories : [
                  { id: 1, name: 'Заміна шин' },
                  { id: 2, name: 'Балансування' },
                  { id: 3, name: 'Ремонт проколів' }
                ]).slice(0, 3).map((category) => (
                  <Link 
                    key={category.id} 
                    to="/client/services"
                    style={{ 
                      color: colors.textSecondary, 
                      textDecoration: 'none'
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Інформація
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link 
                  to="/knowledge-base" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  База знань
                </Link>
                <Link 
                  to="/client/profile" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  Особистий кабінет
                </Link>
                <Link 
                  to="/business-application" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  Для бізнесу
                </Link>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4, 
            pt: 4, 
            borderTop: `1px solid ${colors.borderPrimary}` 
          }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              © 2025 Твоя Шина. Всі права захищені.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* QR Dialog удален - используется прямая ссылка */}
    </>
  );
};

export default ClientFooter; 