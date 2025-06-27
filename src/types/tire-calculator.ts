// Типы для калькулятора шин

// Основная структура размера шины
export interface TireSize {
  width: number;        // Ширина шины в мм (например, 205)
  profile: number;      // Высота профиля в % (например, 55)
  diameter: number;     // Диаметр диска в дюймах (например, 16)
  loadIndex?: number;   // Индекс нагрузки (например, 91)
  speedIndex?: string;  // Индекс скорости (например, "V")
}

// Результат расчета альтернативного размера
export interface TireAlternative {
  size: string;                    // Размер в формате "205/55 R16"
  width: number;                   // Ширина шины в мм
  profile: number;                 // Высота профиля в %
  diameter: number;                // Диаметр диска в дюймах
  calculatedDiameter: number;      // Рассчитанный общий диаметр в мм
  deviationPercent: number;        // Отклонение от оригинала в %
  deviationMm: number;             // Отклонение в мм
  loadIndex: number;               // Индекс нагрузки
  speedIndex: string;              // Индекс скорости
  recommendedRimWidth: string;     // Рекомендуемая ширина диска
  isRecommended: boolean;          // Рекомендуется ли этот размер
  warnings: string[];              // Предупреждения (если есть)
}

// Параметры поиска альтернативных размеров
export interface TireSearchParams {
  originalSize: TireSize;
  maxDeviationPercent: number;     // Максимальное отклонение диаметра в % (по умолчанию 3%)
  allowedWidthRange: number;       // Допустимое изменение ширины в мм (по умолчанию ±20)
  allowedDiameterRange: number;    // Допустимое изменение диаметра диска в дюймах (по умолчанию ±2)
  season?: TireSeason;             // Фильтр по сезону
  minLoadIndex?: number;           // Минимальный индекс нагрузки
  minSpeedIndex?: string;          // Минимальный индекс скорости
  carType?: CarType;               // Тип автомобиля
}

// Сезон шин
export enum TireSeason {
  SUMMER = "summer",
  WINTER = "winter",
  ALL_SEASON = "all_season"
}

// Тип автомобиля
export enum CarType {
  PASSENGER = "passenger",       // Легковой
  SUV = "suv",                  // Внедорожник
  TRUCK = "truck",              // Грузовой
  VAN = "van"                   // Фургон
}

// Результат расчета калькулятора
export interface TireCalculatorResult {
  originalDiameter: number;        // Оригинальный диаметр в мм
  alternatives: TireAlternative[]; // Список альтернативных размеров
  searchParams: TireSearchParams;  // Параметры поиска
  totalFound: number;              // Общее количество найденных вариантов
}

// Влияние на спидометр
export interface SpeedometerImpact {
  realSpeed: number;               // Реальная скорость при показаниях 100 км/ч
  deviationKmh: number;           // Отклонение в км/ч
  deviationPercent: number;        // Отклонение в %
  description: string;             // Описание влияния
}

// Константы для валидации
export const TIRE_CONSTANTS = {
  MIN_WIDTH: 125,                  // Минимальная ширина шины в мм
  MAX_WIDTH: 355,                  // Максимальная ширина шины в мм
  MIN_PROFILE: 25,                 // Минимальная высота профиля в %
  MAX_PROFILE: 85,                 // Максимальная высота профиля в %
  MIN_DIAMETER: 12,                // Минимальный диаметр диска в дюймах
  MAX_DIAMETER: 24,                // Максимальный диаметр диска в дюймах
  MAX_DEVIATION_PERCENT: 5,        // Максимальное безопасное отклонение диаметра в %
  RECOMMENDED_DEVIATION_PERCENT: 3, // Рекомендуемое отклонение диаметра в %
  MM_PER_INCH: 25.4               // Миллиметров в дюйме
} as const;

// Индексы скорости с описанием
export const SPEED_INDEXES = {
  "L": { maxSpeed: 120, description: "до 120 км/ч" },
  "M": { maxSpeed: 130, description: "до 130 км/ч" },
  "N": { maxSpeed: 140, description: "до 140 км/ч" },
  "P": { maxSpeed: 150, description: "до 150 км/ч" },
  "Q": { maxSpeed: 160, description: "до 160 км/ч" },
  "R": { maxSpeed: 170, description: "до 170 км/ч" },
  "S": { maxSpeed: 180, description: "до 180 км/ч" },
  "T": { maxSpeed: 190, description: "до 190 км/ч" },
  "U": { maxSpeed: 200, description: "до 200 км/ч" },
  "H": { maxSpeed: 210, description: "до 210 км/ч" },
  "V": { maxSpeed: 240, description: "до 240 км/ч" },
  "W": { maxSpeed: 270, description: "до 270 км/ч" },
  "Y": { maxSpeed: 300, description: "до 300 км/ч" },
  "Z": { maxSpeed: 300, description: "свыше 300 км/ч" }
} as const;

export type SpeedIndexKey = keyof typeof SPEED_INDEXES;
