import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as CompanyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Assignment as ApplicationIcon,
} from '@mui/icons-material';
import { PartnerApplication, PartnerApplicationStatus } from '../../../types/PartnerApplication';
import { useTheme } from '@mui/material/styles';

interface ApplicationDetailsDialogProps {
  open: boolean;
  application: PartnerApplication | null;
  onClose: () => void;
}

const ApplicationDetailsDialog: React.FC<ApplicationDetailsDialogProps> = ({
  open,
  application,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!application) return null;

  const getStatusColor = (status: PartnerApplicationStatus) => {
    switch (status) {
      case 'new': return 'warning';
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'connected': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('partnerApplications.details.noValue');
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value: string | number | undefined | null;
    isLink?: boolean;
  }> = ({ icon, label, value, isLink = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
      <Box sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        {isLink && value ? (
          <Typography 
            variant="body2" 
            component="a" 
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {value}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: value ? 500 : 400 }}>
            {value || t('partnerApplications.details.noValue')}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApplicationIcon color="primary" />
          <Typography variant="h6">
            {t('partnerApplications.dialogs.viewDetails.title')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Информация о компании */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompanyIcon color="primary" />
              {t('partnerApplications.details.companyInfo')}
            </Typography>
            <Box sx={{ pl: 4 }}>
              <InfoItem
                icon={<CompanyIcon fontSize="small" />}
                label={t('partnerApplications.details.companyName')}
                value={application.company_name}
              />
              <InfoItem
                icon={<ApplicationIcon fontSize="small" />}
                label={t('partnerApplications.details.businessDescription')}
                value={application.business_description}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Контактная информация */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              {t('partnerApplications.details.contactInfo')}
            </Typography>
            <Box sx={{ pl: 4 }}>
              <InfoItem
                icon={<PersonIcon fontSize="small" />}
                label={t('partnerApplications.details.contactPerson')}
                value={application.contact_person}
              />
              <InfoItem
                icon={<EmailIcon fontSize="small" />}
                label={t('partnerApplications.details.email')}
                value={application.email}
              />
              <InfoItem
                icon={<PhoneIcon fontSize="small" />}
                label={t('partnerApplications.details.phone')}
                value={application.phone}
              />
            </Box>
          </Grid>

          {/* Информация о местоположении */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              {t('partnerApplications.details.locationInfo')}
            </Typography>
            <Box sx={{ pl: 4 }}>
              <InfoItem
                icon={<LocationIcon fontSize="small" />}
                label={t('partnerApplications.details.region')}
                value={application.region?.name}
              />
              <InfoItem
                icon={<LocationIcon fontSize="small" />}
                label={t('partnerApplications.details.city')}
                value={application.city}
              />
              <InfoItem
                icon={<LocationIcon fontSize="small" />}
                label={t('partnerApplications.details.address')}
                value={application.address}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Дополнительная информация */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('partnerApplications.details.additionalInfo')}
            </Typography>
            <InfoItem
              icon={<WebsiteIcon fontSize="small" />}
              label={t('partnerApplications.details.website')}
              value={application.website}
              isLink={true}
            />
            <InfoItem
              icon={<LocationIcon fontSize="small" />}
              label={t('partnerApplications.details.expectedServicePoints')}
              value={application.expected_service_points}
            />
            {application.additional_info && (
              <InfoItem
                icon={<ApplicationIcon fontSize="small" />}
                label={t('partnerApplications.details.additionalNotes')}
                value={application.additional_info}
              />
            )}
          </Grid>

          {/* Статус и обработка */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('partnerApplications.details.applicationStatus')}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('partnerApplications.details.applicationStatus')}
              </Typography>
              <Chip
                label={t(`partnerApplications.statusLabels.${application.status}`)}
                color={getStatusColor(application.status) as any}
                size="medium"
              />
            </Box>
            
            <InfoItem
              icon={<ApplicationIcon fontSize="small" />}
              label={t('partnerApplications.details.submissionDate')}
              value={formatDate(application.created_at)}
            />

            {application.processed_by && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('partnerApplications.details.processingInfo')}
                </Typography>
                <InfoItem
                  icon={<PersonIcon fontSize="small" />}
                  label={t('partnerApplications.details.processedBy')}
                  value={`${application.processed_by.first_name} ${application.processed_by.last_name}`}
                />
                {application.processed_at && (
                  <InfoItem
                    icon={<ApplicationIcon fontSize="small" />}
                    label={t('partnerApplications.details.processedAt')}
                    value={formatDate(application.processed_at)}
                  />
                )}
              </Box>
            )}

            {application.admin_notes && (
              <Box sx={{ mt: 2 }}>
                <InfoItem
                  icon={<ApplicationIcon fontSize="small" />}
                  label={t('partnerApplications.details.adminNotes')}
                  value={application.admin_notes}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          {t('partnerApplications.dialogs.viewDetails.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationDetailsDialog; 