import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Интерфейсы
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  services?: any[];
  services_count?: number;
}

export interface CategorySelectionModalProps {
  open: boolean;
  onClose: () => void;
  servicePointName: string;
  categories: ServiceCategory[];
  isLoading: boolean;
  onCategorySelect: (category: ServiceCategory) => void;
  title?: string;
  subtitle?: string;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  open,
  onClose,
  servicePointName,
  categories,
  isLoading,
  onCategorySelect,
  title,
  subtitle
}) => {
  const { t } = useTranslation(['common', 'components']);
  const theme = useTheme();

  const modalTitle = title || t('components:categorySelection.title');
  const modalSubtitle = subtitle || t('components:categorySelection.subtitle', { servicePointName });

  const handleCategoryClick = (category: ServiceCategory) => {
    onCategorySelect(category);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {modalTitle}
        </Typography>
        <IconButton
          aria-label={t('common.close')}
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {modalSubtitle}
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('components:categorySelection.noCategories')}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardActionArea>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                      </Box>
                      
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {category.services?.length 
                            ? t('components:categorySelection.servicesCount', { 
                                count: category.services.length 
                              })
                            : category.services_count 
                              ? t('components:categorySelection.servicesCount', { 
                                  count: category.services_count 
                                })
                              : t('components:categorySelection.availableForBooking')
                          }
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySelectionModal; 