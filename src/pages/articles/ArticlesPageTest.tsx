import React from 'react';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ArticlesPageTest: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Container>
      <Typography variant="h4">
        {t('forms.articles.testPageTitle')}
      </Typography>
    </Container>
  );
};

export default ArticlesPageTest; 