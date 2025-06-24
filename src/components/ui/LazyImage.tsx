import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  alt: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, fallback = null, ...rest }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return fallback ? <>{fallback}</> : <span style={{color:'#bbb'}}>Нет изображения</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      {...rest}
    />
  );
};
