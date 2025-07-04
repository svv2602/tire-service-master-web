import { CarBrand, CarModel } from '../types/car';
import { ClientCar } from '../types/client';

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

/**
 * Проверяет, есть ли автомобиль с указанным номером в списке автомобилей клиента
 * @param licensePlate - номер автомобиля для поиска
 * @param clientCars - список автомобилей клиента
 * @returns true, если автомобиль найден, иначе false
 */
export const isCarInProfile = (licensePlate: string, clientCars: ClientCar[]): boolean => {
  if (!licensePlate || !clientCars || clientCars.length === 0) {
    return false;
  }

  // Нормализуем номер для поиска (убираем пробелы и приводим к верхнему регистру)
  const normalizedSearchPlate = licensePlate.replace(/\s+/g, '').toUpperCase();

  return clientCars.some(car => {
    if (!car.license_plate) return false;
    
    // Нормализуем номер из профиля
    const normalizedCarPlate = car.license_plate.replace(/\s+/g, '').toUpperCase();
    
    return normalizedCarPlate === normalizedSearchPlate;
  });
};

/**
 * Ищет автомобиль в профиле клиента по номеру
 * @param licensePlate - номер автомобиля для поиска
 * @param clientCars - список автомобилей клиента
 * @returns найденный автомобиль или undefined
 */
export const findCarInProfile = (licensePlate: string, clientCars: ClientCar[]): ClientCar | undefined => {
  if (!licensePlate || !clientCars || clientCars.length === 0) {
    return undefined;
  }

  // Нормализуем номер для поиска
  const normalizedSearchPlate = licensePlate.replace(/\s+/g, '').toUpperCase();

  return clientCars.find(car => {
    if (!car.license_plate) return false;
    
    // Нормализуем номер из профиля
    const normalizedCarPlate = car.license_plate.replace(/\s+/g, '').toUpperCase();
    
    return normalizedCarPlate === normalizedSearchPlate;
  });
};

/**
 * Проверяет, нужно ли предложить добавить автомобиль в профиль
 * @param carData - данные автомобиля из бронирования
 * @param clientCars - список автомобилей клиента
 * @returns true, если нужно предложить добавление
 */
export const shouldOfferToAddCar = (
  carData: {
    license_plate: string;
    car_brand?: string;
    car_model?: string;
    car_type_id?: number;
  },
  clientCars: ClientCar[]
): boolean => {
  // Проверяем, что есть номер автомобиля
  if (!carData.license_plate || !carData.license_plate.trim()) {
    return false;
  }

  // Проверяем, что автомобиля нет в профиле
  if (isCarInProfile(carData.license_plate, clientCars)) {
    return false;
  }

  // Предлагаем добавить, если есть хотя бы номер
  return true;
};

/**
 * Подготавливает данные автомобиля для диалога добавления
 * @param formData - данные формы бронирования
 * @returns объект с данными автомобиля
 */
export const prepareCarDataForDialog = (formData: any) => {
  return {
    license_plate: formData.license_plate || '',
    car_brand: formData.car_brand || undefined,
    car_model: formData.car_model || undefined,
    car_type_id: formData.car_type_id || undefined,
  };
}; 