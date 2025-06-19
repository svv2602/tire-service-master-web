import { CarBrand, CarModel } from '../types/car';

/**
 * Получает название бренда автомобиля
 * @param brand Бренд автомобиля или его ID
 * @returns Название бренда
 */
export const getBrandName = (brand?: CarBrand | string | { id: number; name: string }): string => {
  if (!brand) return '';
  
  if (typeof brand === 'string') {
    return brand;
  }
  
  return brand.name || '';
};

/**
 * Получает название модели автомобиля
 * @param model Модель автомобиля или ее ID
 * @returns Название модели
 */
export const getModelName = (model?: CarModel | string | { id: number; name: string }): string => {
  if (!model) return '';
  
  if (typeof model === 'string') {
    return model;
  }
  
  return model.name || '';
}; 