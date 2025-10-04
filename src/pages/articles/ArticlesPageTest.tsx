import React from 'react';
import { Container, Typography } from '../../components/ui';;
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