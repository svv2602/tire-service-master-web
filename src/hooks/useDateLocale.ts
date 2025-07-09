import { ru, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

// Hook для получения правильной локали date-fns в зависимости от языка интерфейса
export const useDateLocale = () => {
  const { i18n } = useTranslation();
  
  // Маппинг языков интерфейса на локали date-fns
  const localeMap: Record<string, any> = {
    'ru': ru,
    'uk': uk,
    'ru-RU': ru,
    'uk-UA': uk
  };
  
  // Возвращаем соответствующую локаль или русскую по умолчанию
  return localeMap[i18n.language] || ru;
};

export default useDateLocale;
