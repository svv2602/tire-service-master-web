// Типы для react-i18next совместимые с TypeScript 4.9
declare module 'react-i18next' {
  export function useTranslation(ns?: string | string[]): {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  };
  
  export interface UseTranslationOptions {
    useSuspense?: boolean;
    keyPrefix?: string;
  }
}
