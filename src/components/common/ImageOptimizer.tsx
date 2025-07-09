import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
  className?: string;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Компонент для оптимизации изображений с ленивой загрузкой и плейсхолдером
 * @param src - URL изображения
 * @param alt - альтернативный текст
 * @param width - ширина изображения
 * @param height - высота изображения
 * @param className - дополнительные CSS классы
 * @param quality - качество изображения (1-100)
 * @param objectFit - способ отображения изображения
 */
const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  width,
  height,
  className,
  quality = 80,
  objectFit = 'cover'
}) => {
  const { t } = useTranslation('components');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Проверяем, содержит ли URL уже параметры
  const hasParams = src.includes('?');
  
  // Добавляем параметры оптимизации к URL
  const optimizedSrc = src + (hasParams ? '&' : '?') + `q=${quality}`;

  return (
    <Box
      position="relative"
      width={width}
      height={height}
      overflow="hidden"
      className={className}
    >
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      
      {!error ? (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            display: loaded ? 'block' : 'none',
            objectFit,
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          bgcolor="rgba(0,0,0,0.1)"
          color="text.secondary"
          fontSize="0.75rem"
          textAlign="center"
          p={1}
        >
          {t('imageOptimizer.unavailable')}
        </Box>
      )}
    </Box>
  );
};

export default ImageOptimizer; 