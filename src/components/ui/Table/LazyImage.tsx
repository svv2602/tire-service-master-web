import React from 'react';

export interface LazyImageProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt = '', fallback = null, style }) => {
  if (!src) {
    return <>{fallback}</>;
  }
  
  return <img src={src} alt={alt} loading="lazy" style={style} />;
};
