// Временное исправление для совместимости react-i18next с TypeScript 4.9
declare module 'react-i18next' {
  export * from 'react-i18next/index';
  export { default } from 'react-i18next/index';
  
  // Переопределяем проблемные типы с простой типизацией
  export function useTranslation(
    ns?: string | string[],
    options?: any
  ): {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  };
}
