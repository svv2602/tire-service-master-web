import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Хук для управления фокусом на заголовке страницы
 * Автоматически фокусирует заголовок при переходах по ссылкам
 */
export const usePageTitleFocus = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();
  const previousLocationRef = useRef(location.pathname);

  useEffect(() => {
    // Проверяем, изменился ли путь (произошел переход)
    if (previousLocationRef.current !== location.pathname) {
      // Устанавливаем фокус на заголовок с небольшой задержкой
      // для завершения рендеринга компонента
      const timeoutId = setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus({ preventScroll: false });
          
          // Прокручиваем к верху страницы для лучшего UX
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 100);

      // Обновляем предыдущий путь
      previousLocationRef.current = location.pathname;

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  return titleRef;
}; 