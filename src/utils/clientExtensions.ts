import { Client } from '../types/client';

// Утилитарные функции для работы с автомобилями клиентов
export const getBrandName = (client: Client, carId: number): string => {
  const car = client.cars?.find(car => car.id === carId);
  return car?.brand?.name || '';
};

export const getModelName = (client: Client, carId: number): string => {
  const car = client.cars?.find(car => car.id === carId);
  return car?.model?.name || '';
};

// Функция для получения полного имени клиента
export const getFullName = (client: Client): string => {
  if (!client.user) return '';
  
  const { first_name, last_name, middle_name } = client.user;
  return [first_name, middle_name, last_name].filter(Boolean).join(' ');
};

// Создаем функцию для добавления геттеров к объекту клиента
export const extendClient = (client: Client): Client => {
  if (!client) return client;
  
  // Используем Object.defineProperties для добавления геттеров
  const extendedClient = { ...client } as any;
  
  // Добавляем геттеры для доступа к полям пользователя
  Object.defineProperties(extendedClient, {
    first_name: {
      get: function() {
        return this.user?.first_name || '';
      },
      enumerable: true,
      configurable: true
    },
    last_name: {
      get: function() {
        return this.user?.last_name || '';
      },
      enumerable: true,
      configurable: true
    },
    middle_name: {
      get: function() {
        return this.user?.middle_name || '';
      },
      enumerable: true,
      configurable: true
    },
    phone: {
      get: function() {
        return this.user?.phone || '';
      },
      enumerable: true,
      configurable: true
    },
    email: {
      get: function() {
        return this.user?.email || '';
      },
      enumerable: true,
      configurable: true
    }
  });
  
  return extendedClient as Client;
};

// Функция для расширения массива клиентов
export const extendClients = (clients: Client[]): Client[] => {
  return clients.map(client => extendClient(client));
};

/**
 * Преобразует данные клиента для формы
 * @param client Объект клиента
 * @returns Данные для формы
 */
export const clientToFormData = (client: Client | null): any => {
  if (!client) {
    return {
      user_attributes: {
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '',
        email: '',
        is_active: true
      },
      preferred_notification_method: 'push',
      marketing_consent: false
    };
  }

  return {
    user_attributes: {
      first_name: client.user?.first_name || '',
      last_name: client.user?.last_name || '',
      middle_name: client.user?.middle_name || '',
      phone: client.user?.phone || '',
      email: client.user?.email || '',
      is_active: client.user?.is_active || true
    },
    preferred_notification_method: client.preferred_notification_method || 'push',
    marketing_consent: client.marketing_consent || false
  };
};

// Инициализация расширений
export const initClientExtensions = () => {
  // Эта функция вызывается для активации расширений
  console.debug('Client extensions initialized');
}; 