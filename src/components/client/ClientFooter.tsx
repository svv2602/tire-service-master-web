import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
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
  const [telegramQrOpen, setTelegramQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

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
  const generateQRCode = async () => {
    const botUrl = `https://t.me/${botUsername}`;
    setQrCodeUrl(botUrl);
    
    if (qrCanvasRef.current) {
      try {
        await QRCode.toCanvas(qrCanvasRef.current, botUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Ошибка генерации QR кода:', error);
      }
    }
  };

  const handleTelegramClick = () => {
    setTelegramQrOpen(true);
    setTimeout(generateQRCode, 100);
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
                🚗 {t('client.footer.companyTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                {footerContent?.content || t('client.footer.companyDescription')}
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
                  title={t('client.footer.telegramSubscribe')}
                >
                  <TelegramIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                {t('client.footer.servicesTitle')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {serviceCategories.slice(0, 3).map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/client/services?category=${category.id}`}
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
                {t('client.footer.informationTitle')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link 
                  to="/knowledge-base" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  {t('client.footer.knowledgeBase')}
                </Link>
                <Link 
                  to="/client/profile" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  {t('client.footer.personalCabinet')}
                </Link>
                <Link 
                  to="/login" 
                  style={{ 
                    color: colors.textSecondary, 
                    textDecoration: 'none'
                  }}
                >
                  {t('client.footer.forBusiness')}
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
              {footerContent?.settings?.copyright || t('client.footer.copyright')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Telegram QR Dialog */}
      <Dialog open={telegramQrOpen} onClose={() => setTelegramQrOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <TelegramIcon sx={{ color: '#0088cc', mr: 1 }} />
          {t('client.footer.telegramDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <canvas 
              ref={qrCanvasRef}
              style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('client.footer.telegramDialog.description')}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, fontFamily: 'monospace', display: 'block' }}>
              {qrCodeUrl || `https://t.me/${botUsername}`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTelegramQrOpen(false)}>
            {t('client.footer.telegramDialog.close')}
          </Button>
          <Button 
            variant="contained" 
            href={`https://t.me/${botUsername}`}
            target="_blank"
            startIcon={<TelegramIcon />}
            sx={{ bgcolor: '#0088cc' }}
          >
            {t('client.footer.telegramDialog.openTelegram')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientFooter; 