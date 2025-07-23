import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noIndex?: boolean;
  canonical?: string;
}

interface SEOHeadProps extends SEOProps {
  children?: React.ReactNode;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  noIndex = false,
  canonical,
  children
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'uk';
  
  // Базовые настройки сайта
  const siteConfig = {
    siteName: 'Твоя Шина - Професійний шиномонтаж',
    defaultTitle: 'Твоя Шина - Найкращий шиномонтаж в Україні',
    defaultDescription: 'Професійні послуги шиномонтажу в Україні. Швидко, якісно, недорого. Онлайн запис, зручне розташування, досвідчені майстри.',
    defaultKeywords: ['шиномонтаж', 'заміна шин', 'балансування коліс', 'ремонт шин', 'автосервіс', 'Україна'],
    defaultImage: '/image/tire-service-og.jpg',
    siteUrl: process.env.REACT_APP_SITE_URL || 'https://tvoya-shina.ua',
    twitterHandle: '@tvoya_shina'
  };

  // Формируем финальные значения
  const finalTitle = title 
    ? `${title} | ${siteConfig.siteName}`
    : siteConfig.defaultTitle;
    
  const finalDescription = description || siteConfig.defaultDescription;
  const finalKeywords = keywords.length > 0 
    ? [...keywords, ...siteConfig.defaultKeywords]
    : siteConfig.defaultKeywords;
    
  const finalImage = image || siteConfig.defaultImage;
  const finalUrl = url || siteConfig.siteUrl;

  return (
    <Helmet>
      {/* Базовые метатеги */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="language" content={currentLanguage} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph метатеги */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteConfig.siteName} />
      <meta property="og:locale" content={currentLanguage === 'uk' ? 'uk_UA' : 'ru_RU'} />
      
      {/* Twitter Card метатеги */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Дополнительные метатеги для статей */}
      {type === 'article' && (
        <>
          {author && <meta name="author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
        </>
      )}
      
      {/* Дополнительные метатеги для бизнеса */}
      <meta name="geo.region" content="UA" />
      <meta name="geo.placename" content="Україна" />
      <meta name="business:contact_data:locality" content="Україна" />
      <meta name="business:contact_data:country_name" content="Україна" />
      
      {/* Schema.org разметка для локального бизнеса */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoRepair",
          "name": siteConfig.siteName,
          "description": finalDescription,
          "url": siteConfig.siteUrl,
          "logo": finalImage,
          "sameAs": [
            "https://www.facebook.com/tvoya.shina",
            "https://www.instagram.com/tvoya_shina"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "UA",
            "addressLocality": "Україна"
          },
          "serviceArea": {
            "@type": "Country",
            "name": "Україна"
          },
          "priceRange": "$$",
          "telephone": "+380-800-123-456",
          "openingHours": "Mo-Su 08:00-20:00"
        })}
      </script>
      
      {/* Дополнительные элементы head */}
      {children}
    </Helmet>
  );
}; 