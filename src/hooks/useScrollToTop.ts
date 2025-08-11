/**
 * Хук для автоматической прокрутки к верху страницы
 * Особенно полезен для мобильных устройств при переходах между шагами/страницами
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopOptions {
  /** Поведение прокрутки: 'auto' | 'smooth' */
  behavior?: ScrollBehavior;
  /** Задержка перед прокруткой в миллисекундах */
  delay?: number;
  /** Активировать только на мобильных устройствах */
  mobileOnly?: boolean;
  /** Пороговое значение ширины экрана для мобильных устройств */
  mobileBreakpoint?: number;
}

/**
 * Хук для автоматической прокрутки к верху страницы при изменении маршрута
 */
export const useScrollToTopOnRouteChange = (options: ScrollToTopOptions = {}) => {
  const location = useLocation();
  const {
    behavior = 'smooth',
    delay = 100,
    mobileOnly = true,
    mobileBreakpoint = 768
  } = options;

  useEffect(() => {
    const shouldScroll = !mobileOnly || window.innerWidth <= mobileBreakpoint;
    
    if (shouldScroll) {
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior
        });
      };

      if (delay > 0) {
        const timeoutId = setTimeout(scrollToTop, delay);
        return () => clearTimeout(timeoutId);
      } else {
        scrollToTop();
      }
    }
  }, [location.pathname, behavior, delay, mobileOnly, mobileBreakpoint]);
};

/**
 * Хук для программной прокрутки к верху страницы
 * Возвращает функцию для ручного вызова прокрутки
 */
export const useScrollToTop = (options: ScrollToTopOptions = {}) => {
  const {
    behavior = 'smooth',
    delay = 0,
    mobileOnly = true,
    mobileBreakpoint = 768
  } = options;

  const scrollToTop = useCallback(() => {
    const shouldScroll = !mobileOnly || window.innerWidth <= mobileBreakpoint;
    
    if (shouldScroll) {
      const doScroll = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior
        });
      };

      if (delay > 0) {
        setTimeout(doScroll, delay);
      } else {
        doScroll();
      }
    }
  }, [behavior, delay, mobileOnly, mobileBreakpoint]);

  return scrollToTop;
};

/**
 * Хук для прокрутки к конкретному элементу
 * Полезен для фокусировки на заголовках шагов
 */
export const useScrollToElement = (options: ScrollToTopOptions = {}) => {
  const {
    behavior = 'smooth',
    delay = 0,
    mobileOnly = true,
    mobileBreakpoint = 768
  } = options;

  const scrollToElement = useCallback((elementId: string, offset: number = 80) => {
    const shouldScroll = !mobileOnly || window.innerWidth <= mobileBreakpoint;
    
    if (shouldScroll) {
      const doScroll = () => {
        const element = document.getElementById(elementId);
        if (element) {
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            left: 0,
            behavior
          });
        }
      };

      if (delay > 0) {
        setTimeout(doScroll, delay);
      } else {
        doScroll();
      }
    }
  }, [behavior, delay, mobileOnly, mobileBreakpoint]);

  return scrollToElement;
};

export default useScrollToTop;