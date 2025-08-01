import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalOffer as PriceIcon,
  Store as StoreIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { TireGroup, SupplierProduct } from '../../../api/supplierProducts.api';

interface SupplierProductsResultsProps {
  groups: TireGroup[];
  loading?: boolean;
  error?: string;
  showAllOffers?: boolean;
  onProductClick?: (product: SupplierProduct) => void;
  onSupplierClick?: (supplierId: number) => void;
}

const SupplierProductsResults: React.FC<SupplierProductsResultsProps> = ({
  groups,
  loading = false,
  error,
  showAllOffers = true,
  onProductClick,
  onSupplierClick,
}) => {
  const { t } = useTranslation(['tireSearch', 'common']);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // Обработчик изменения аккордиона
  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Получение цвета для приоритета поставщика
  const getSupplierPriorityColor = (priority: number) => {
    if (priority === 1) return 'success';
    if (priority <= 3) return 'warning';
    return 'default';
  };

  // Получение иконки сезонности
  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'winter':
        return '❄️';
      case 'summer':
        return '☀️';
      case 'all_season':
        return '🌤️';
      default:
        return '🛞';
    }
  };

  // Форматирование цены
  const formatPriceRange = (min: string, max: string) => {
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);
    
    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString()} грн`;
    }
    return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} грн`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('tireSearch:searching')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!groups.length) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          {t('tireSearch:noSupplierProductsFound')}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Заголовок секции */}
      <Box display="flex" alignItems="center" mb={2}>
        <StoreIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3">
          {t('tireSearch:supplierProducts')} ({groups.length})
        </Typography>
        <Tooltip title={showAllOffers ? t('tireSearch:showingAllOffers') : t('tireSearch:showingBestOffers')}>
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Аккордионы с группами товаров */}
      {groups.map((group, index) => (
        <Accordion
          key={group.tire_key}
          expanded={expandedAccordion === group.tire_key}
          onChange={handleAccordionChange(group.tire_key)}
          sx={{ mb: 1, border: '1px solid', borderColor: 'divider' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Box display="flex" alignItems="center" width="100%" mr={2}>
              {/* Основная информация о шине */}
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getSeasonIcon(group.tire_params.season)} {group.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('tireSearch:season')}: {group.tire_params.season === 'winter' ? 'Зимние' : 
                   group.tire_params.season === 'summer' ? 'Летние' : 'Всесезонные'}
                </Typography>
              </Box>

              {/* Статистика предложений */}
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<StoreIcon />}
                  label={`${group.suppliers_count} ${t('tireSearch:suppliers')}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<PriceIcon />}
                  label={formatPriceRange(group.price_range.min, group.price_range.max)}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            
            {/* Список товаров от поставщиков */}
            <Grid container spacing={2}>
              {group.products.map((product) => (
                <Grid item xs={12} md={6} lg={4} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: onProductClick ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: onProductClick ? 'translateY(-2px)' : 'none',
                        boxShadow: onProductClick ? 4 : 1,
                      },
                    }}
                    onClick={() => onProductClick?.(product)}
                  >
                    <CardContent>
                      {/* Информация о поставщике */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: getSupplierPriorityColor(product.supplier.priority) + '.main',
                            mr: 1,
                          }}
                        >
                          {product.supplier.priority === 1 && <StarIcon fontSize="small" />}
                          {product.supplier.priority > 1 && (
                            <Typography variant="caption" fontWeight="bold">
                              {product.supplier.priority}
                            </Typography>
                          )}
                        </Avatar>
                        <Box flex={1}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{
                              cursor: onSupplierClick ? 'pointer' : 'default',
                              '&:hover': {
                                textDecoration: onSupplierClick ? 'underline' : 'none',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSupplierClick?.(product.supplier.id);
                            }}
                          >
                            {product.supplier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('tireSearch:priority')}: {product.supplier.priority}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Информация о товаре */}
                      <Typography variant="body2" gutterBottom>
                        {product.name}
                      </Typography>

                      {/* Цена */}
                      <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
                        <Typography
                          variant="h6"
                          color="success.main"
                          fontWeight="bold"
                        >
                          {product.formatted_price}
                        </Typography>
                        <Chip
                          label={product.stock_status}
                          size="small"
                          color={product.in_stock ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>

                      {/* Дополнительная информация */}
                      {(product.country || product.year_week) && (
                        <Box mt={1}>
                          {product.country && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('tireSearch:country')}: {product.country}
                            </Typography>
                          )}
                          {product.year_week && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('tireSearch:productionDate')}: {product.year_week}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Кнопка перехода к товару */}
                      {product.product_url && (
                        <Box mt={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LaunchIcon />}
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            fullWidth
                          >
                            {t('tireSearch:viewProduct')}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Информация о режиме отображения */}
      <Box mt={2}>
        <Alert severity="info" variant="outlined">
          <Typography variant="body2">
            {showAllOffers
              ? t('tireSearch:showingAllOffersInfo')
              : t('tireSearch:showingBestOffersInfo')}
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SupplierProductsResults;