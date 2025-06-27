import {
  TireSize,
  TireAlternative,
  TireSearchParams,
  TireCalculatorResult,
  SpeedometerImpact,
  TIRE_CONSTANTS,
  SPEED_INDEXES,
  SpeedIndexKey,
  TireSeason,
  CarType
} from '../types/tire-calculator';

/**
 * Рассчитывает общий диаметр шины по формуле:
 * D = (W × H / 100 × 2) + (R × 25.4)
 */
export function calculateTireDiameter(tireSize: TireSize): number {
  const { width, profile, diameter } = tireSize;
  const sidewallHeight = (width * profile / 100) * 2; // Обе боковины
  const rimDiameterMm = diameter * TIRE_CONSTANTS.MM_PER_INCH;
  return sidewallHeight + rimDiameterMm;
}

/**
 * Форматирует размер шины в стандартный вид
 */
export function formatTireSize(tireSize: TireSize, includeIndexes: boolean = false): string {
  const { width, profile, diameter, loadIndex, speedIndex } = tireSize;
  let formatted = `${width}/${profile} R${diameter}`;
  
  if (includeIndexes && loadIndex && speedIndex) {
    formatted += ` ${loadIndex}${speedIndex}`;
  }
  
  return formatted;
}

/**
 * Парсит строку размера шины в объект TireSize
 */
export function parseTireSize(sizeString: string): TireSize | null {
  // Регулярное выражение для парсинга размера типа "205/55 R16" или "205/55 R16 91V"
  const regex = /^(\d{3})\/(\d{2})\s*R(\d{2})(?:\s*(\d{2,3})([A-Z]))?$/i;
  const match = sizeString.trim().match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, width, profile, diameter, loadIndex, speedIndex] = match;
  
  return {
    width: parseInt(width, 10),
    profile: parseInt(profile, 10),
    diameter: parseInt(diameter, 10),
    loadIndex: loadIndex ? parseInt(loadIndex, 10) : undefined,
    speedIndex: speedIndex || undefined
  };
}

/**
 * Валидирует размер шины
 */
export function validateTireSize(tireSize: TireSize): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { width, profile, diameter } = tireSize;
  
  if (width < TIRE_CONSTANTS.MIN_WIDTH || width > TIRE_CONSTANTS.MAX_WIDTH) {
    errors.push(`Ширина шины должна быть от ${TIRE_CONSTANTS.MIN_WIDTH} до ${TIRE_CONSTANTS.MAX_WIDTH} мм`);
  }
  
  if (profile < TIRE_CONSTANTS.MIN_PROFILE || profile > TIRE_CONSTANTS.MAX_PROFILE) {
    errors.push(`Высота профиля должна быть от ${TIRE_CONSTANTS.MIN_PROFILE} до ${TIRE_CONSTANTS.MAX_PROFILE}%`);
  }
  
  if (diameter < TIRE_CONSTANTS.MIN_DIAMETER || diameter > TIRE_CONSTANTS.MAX_DIAMETER) {
    errors.push(`Диаметр диска должен быть от ${TIRE_CONSTANTS.MIN_DIAMETER} до ${TIRE_CONSTANTS.MAX_DIAMETER} дюймов`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Рассчитывает рекомендуемую ширину диска для шины
 */
export function calculateRecommendedRimWidth(tireWidth: number): string {
  // Примерная формула: ширина диска = (ширина шины в мм / 25.4) * 0.7
  const minWidth = Math.round((tireWidth / 25.4) * 0.6 * 2) / 2; // Округление до 0.5
  const maxWidth = Math.round((tireWidth / 25.4) * 0.8 * 2) / 2;
  const recommended = Math.round((tireWidth / 25.4) * 0.7 * 2) / 2;
  
  return `${minWidth}-${maxWidth}" (рек. ${recommended}")`;
}

/**
 * Сравнивает индексы скорости
 */
export function compareSpeedIndexes(index1: string, index2: string): number {
  const speeds = Object.keys(SPEED_INDEXES);
  const pos1 = speeds.indexOf(index1.toUpperCase());
  const pos2 = speeds.indexOf(index2.toUpperCase());
  
  if (pos1 === -1 || pos2 === -1) return 0;
  return pos1 - pos2;
}

/**
 * Рассчитывает влияние на спидометр
 */
export function calculateSpeedometerImpact(
  originalDiameter: number,
  newDiameter: number,
  speedometerReading: number = 100
): SpeedometerImpact {
  const ratio = newDiameter / originalDiameter;
  const realSpeed = speedometerReading * ratio;
  const deviationKmh = realSpeed - speedometerReading;
  const deviationPercent = (ratio - 1) * 100;
  
  let description = '';
  if (Math.abs(deviationPercent) < 0.5) {
    description = 'Влияние на спидометр минимальное';
  } else if (deviationPercent > 0) {
    description = `Спидометр будет показывать меньше реальной скорости на ${Math.abs(deviationKmh).toFixed(1)} км/ч`;
  } else {
    description = `Спидометр будет показывать больше реальной скорости на ${Math.abs(deviationKmh).toFixed(1)} км/ч`;
  }
  
  return {
    realSpeed: Math.round(realSpeed * 10) / 10,
    deviationKmh: Math.round(deviationKmh * 10) / 10,
    deviationPercent: Math.round(deviationPercent * 100) / 100,
    description
  };
}

/**
 * Генерирует все возможные комбинации размеров шин
 */
export function generateTireAlternatives(searchParams: TireSearchParams): TireAlternative[] {
  const { originalSize, maxDeviationPercent, allowedWidthRange, allowedDiameterRange } = searchParams;
  const originalDiameter = calculateTireDiameter(originalSize);
  const alternatives: TireAlternative[] = [];
  
  // Диапазоны для поиска
  const minDiameter = originalDiameter * (1 - maxDeviationPercent / 100);
  const maxDiameter = originalDiameter * (1 + maxDeviationPercent / 100);
  const minWidth = Math.max(TIRE_CONSTANTS.MIN_WIDTH, originalSize.width - allowedWidthRange);
  const maxWidth = Math.min(TIRE_CONSTANTS.MAX_WIDTH, originalSize.width + allowedWidthRange);
  const minRimDiameter = Math.max(TIRE_CONSTANTS.MIN_DIAMETER, originalSize.diameter - allowedDiameterRange);
  const maxRimDiameter = Math.min(TIRE_CONSTANTS.MAX_DIAMETER, originalSize.diameter + allowedDiameterRange);
  
  // Перебираем все возможные комбинации
  for (let width = minWidth; width <= maxWidth; width += 5) {
    // Исключаем все размеры кратные 10
    if (width % 10 === 0) {
      continue;
    }
    
    for (let profile = TIRE_CONSTANTS.MIN_PROFILE; profile <= TIRE_CONSTANTS.MAX_PROFILE; profile += 5) {
      for (let rimDiameter = minRimDiameter; rimDiameter <= maxRimDiameter; rimDiameter++) {
        const candidateSize: TireSize = {
          width,
          profile,
          diameter: rimDiameter,
          loadIndex: originalSize.loadIndex || 91,
          speedIndex: originalSize.speedIndex || 'H'
        };
        
        const candidateDiameter = calculateTireDiameter(candidateSize);
        
        // Проверяем, попадает ли в допустимый диапазон
        if (candidateDiameter >= minDiameter && candidateDiameter <= maxDiameter) {
          const deviationMm = candidateDiameter - originalDiameter;
          const deviationPercent = (deviationMm / originalDiameter) * 100;
          
          // Проверяем индексы нагрузки и скорости
          const loadIndexOk = !searchParams.minLoadIndex || candidateSize.loadIndex! >= searchParams.minLoadIndex;
          const speedIndexOk = !searchParams.minSpeedIndex || 
            compareSpeedIndexes(candidateSize.speedIndex!, searchParams.minSpeedIndex) >= 0;
          
          if (loadIndexOk && speedIndexOk) {
            const warnings: string[] = [];
            
            // Добавляем предупреждения
            if (Math.abs(deviationPercent) > TIRE_CONSTANTS.RECOMMENDED_DEVIATION_PERCENT) {
              warnings.push(`Отклонение диаметра ${deviationPercent.toFixed(1)}% превышает рекомендуемые 3%`);
            }
            
            if (Math.abs(width - originalSize.width) > 20) {
              warnings.push(`Значительное изменение ширины шины`);
            }
            
            alternatives.push({
              size: formatTireSize(candidateSize, false),
              width,
              profile,
              diameter: rimDiameter,
              calculatedDiameter: candidateDiameter,
              deviationPercent: Math.round(deviationPercent * 100) / 100,
              deviationMm: Math.round(deviationMm * 10) / 10,
              loadIndex: candidateSize.loadIndex!,
              speedIndex: candidateSize.speedIndex!,
              recommendedRimWidth: calculateRecommendedRimWidth(width),
              isRecommended: Math.abs(deviationPercent) <= TIRE_CONSTANTS.RECOMMENDED_DEVIATION_PERCENT,
              warnings
            });
          }
        }
      }
    }
  }
  
  // Сортируем по отклонению диаметра
  alternatives.sort((a, b) => Math.abs(a.deviationPercent) - Math.abs(b.deviationPercent));
  
  return alternatives;
}

/**
 * Основная функция калькулятора шин
 */
export function calculateTireAlternatives(searchParams: TireSearchParams): TireCalculatorResult {
  const originalDiameter = calculateTireDiameter(searchParams.originalSize);
  const alternatives = generateTireAlternatives(searchParams);
  
  return {
    originalDiameter,
    alternatives: alternatives.slice(0, 50), // Ограничиваем количество результатов
    searchParams,
    totalFound: alternatives.length
  };
}

/**
 * Получает популярные размеры шин для автозаполнения
 */
export function getPopularTireSizes(): TireSize[] {
  return [
    { width: 175, profile: 70, diameter: 14 },
    { width: 185, profile: 65, diameter: 15 },
    { width: 195, profile: 65, diameter: 15 },
    { width: 195, profile: 60, diameter: 16 },
    { width: 205, profile: 55, diameter: 16 },
    { width: 205, profile: 60, diameter: 16 },
    { width: 215, profile: 60, diameter: 16 },
    { width: 215, profile: 55, diameter: 17 },
    { width: 225, profile: 45, diameter: 17 },
    { width: 225, profile: 50, diameter: 17 },
    { width: 235, profile: 45, diameter: 17 },
    { width: 235, profile: 40, diameter: 18 },
    { width: 245, profile: 40, diameter: 18 },
    { width: 245, profile: 35, diameter: 19 },
    { width: 255, profile: 35, diameter: 19 },
    { width: 265, profile: 30, diameter: 20 },
    { width: 275, profile: 30, diameter: 20 },
    { width: 285, profile: 30, diameter: 20 }
  ];
}
