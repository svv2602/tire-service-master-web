import type { TireSearchResult, TireSize, TireDiameterGroup } from '../types/tireSearch';

/**
 * Группирует результаты поиска шин по диаметрам
 * @param results - массив результатов поиска
 * @returns массив групп по диаметрам
 */
export const groupResultsByDiameter = (results: TireSearchResult[]): TireDiameterGroup[] => {
  // Создаем карту для группировки по диаметрам
  const diameterMap = new Map<number, {
    configurations: TireSearchResult[];
    sizes: TireSize[];
    brands: Set<string>;
    yearFrom: number;
    yearTo: number;
  }>();

  // Группируем результаты
  results.forEach(result => {
    result.tire_sizes.forEach(size => {
      const diameter = size.diameter;
      
      if (!diameterMap.has(diameter)) {
        diameterMap.set(diameter, {
          configurations: [],
          sizes: [],
          brands: new Set(),
          yearFrom: result.year_from,
          yearTo: result.year_to
        });
      }

      const group = diameterMap.get(diameter)!;
      
      // Добавляем конфигурацию, если еще не добавлена
      if (!group.configurations.find(config => config.id === result.id)) {
        group.configurations.push(result);
        group.brands.add(result.brand_name);
        
        // Обновляем диапазон лет
        group.yearFrom = Math.min(group.yearFrom, result.year_from);
        group.yearTo = Math.max(group.yearTo, result.year_to);
      }
      
      // Добавляем размер, если еще не добавлен
      const sizeKey = `${size.width}/${size.height}R${size.diameter}`;
      if (!group.sizes.find(s => `${s.width}/${s.height}R${s.diameter}` === sizeKey)) {
        group.sizes.push(size);
      }
    });
  });

  // Преобразуем карту в массив групп
  const diameterGroups: TireDiameterGroup[] = Array.from(diameterMap.entries()).map(([diameter, data]) => ({
    diameter,
    configurations: data.configurations,
    totalSizes: data.sizes.length,
    brands: Array.from(data.brands).sort(),
    yearRange: {
      from: data.yearFrom,
      to: data.yearTo
    },
    sizes: data.sizes.sort((a, b) => {
      // Сортируем размеры по ширине, затем по высоте
      if (a.width !== b.width) return a.width - b.width;
      return a.height - b.height;
    })
  }));

  // Сортируем группы по диаметру
  return diameterGroups.sort((a, b) => a.diameter - b.diameter);
};

/**
 * Извлекает параметры поиска из строки запроса или parsed_data
 * @param query - исходный поисковый запрос
 * @param parsedData - разобранные данные поиска
 * @returns объект с параметрами поиска
 */
export const extractSearchParams = (query: string, parsedData?: any) => {
  const params: {
    brand?: string;
    seasonality?: string;
    manufacturer?: string;
  } = {};

  // Извлекаем бренд из parsed_data или из запроса
  if (parsedData?.brand) {
    params.brand = parsedData.brand;
  }

  // Определяем сезонность по ключевым словам в запросе
  const queryLower = query.toLowerCase();
  if (queryLower.includes('зимн') || queryLower.includes('winter')) {
    params.seasonality = 'зимние';
  } else if (queryLower.includes('летн') || queryLower.includes('summer')) {
    params.seasonality = 'летние';
  } else if (queryLower.includes('всесезон') || queryLower.includes('all-season')) {
    params.seasonality = 'всесезонные';
  }

  // Определение производителя по популярным брендам (русские и английские названия)
  const popularBrands = [
    { en: 'continental', ru: ['континенталь', 'континентал'] },
    { en: 'michelin', ru: ['мишлен', 'мишелин'] },
    { en: 'bridgestone', ru: ['бриджстоун', 'бриджстон'] },
    { en: 'pirelli', ru: ['пирелли', 'пирели'] },
    { en: 'goodyear', ru: ['гудиер', 'гудьир'] },
    { en: 'nokian', ru: ['нокиан', 'нокия'] },
    { en: 'hankook', ru: ['ханкук', 'хэнкук'] },
    { en: 'kumho', ru: ['кумхо', 'кумхо'] },
    { en: 'toyo', ru: ['тойо'] },
    { en: 'yokohama', ru: ['йокохама', 'йокогама'] },
    { en: 'dunlop', ru: ['данлоп'] },
    { en: 'cooper', ru: ['купер'] },
    { en: 'maxxis', ru: ['максис', 'макссис'] },
    { en: 'falken', ru: ['фалькен', 'фалкен'] }
  ];
  
  for (const brand of popularBrands) {
    // Проверяем английское название
    if (queryLower.includes(brand.en)) {
      params.manufacturer = brand.en;
      break;
    }
    // Проверяем русские варианты
    for (const ruVariant of brand.ru) {
      if (queryLower.includes(ruVariant)) {
        params.manufacturer = brand.en; // Сохраняем английское название для API
        break;
      }
    }
    if (params.manufacturer) break;
  }

  return params;
};

/**
 * Создает URL для перехода к клиентской странице предложений шин
 * @param tireSize - размер шины
 * @param searchParams - параметры поиска
 * @returns URL для навигации
 */
export const createTireOffersUrl = (
  tireSize: TireSize,
  searchParams: { brand?: string; seasonality?: string; manufacturer?: string }
) => {
  const baseUrl = '/client/tire-offers';
  const params = new URLSearchParams();

  // Добавляем размер шины как основной параметр
  const sizeFilter = `${tireSize.width}/${tireSize.height}R${tireSize.diameter}`;
  params.set('size', sizeFilter);

  // Добавляем дополнительные фильтры
  if (searchParams.brand) {
    params.set('brand', searchParams.brand);
  }

  if (searchParams.seasonality) {
    params.set('seasonality', searchParams.seasonality);
  }

  if (searchParams.manufacturer && searchParams.manufacturer !== searchParams.brand) {
    params.set('manufacturer', searchParams.manufacturer);
  }

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Создает URL для перехода к странице поставщика с фильтрами (для админов)
 * @param supplierId - ID поставщика
 * @param tireSize - размер шины
 * @param searchParams - параметры поиска
 * @returns URL для навигации
 */
export const createSupplierUrl = (
  supplierId: number,
  tireSize: TireSize,
  searchParams: { brand?: string; seasonality?: string; manufacturer?: string }
) => {
  const baseUrl = `/admin/suppliers/${supplierId}`;
  const params = new URLSearchParams();

  // Добавляем фильтр по размеру шины
  const sizeFilter = `${tireSize.width}/${tireSize.height}R${tireSize.diameter}`;
  params.set('search', sizeFilter);

  // Добавляем дополнительные фильтры если есть
  if (searchParams.brand) {
    const currentSearch = params.get('search') || '';
    params.set('search', `${currentSearch} ${searchParams.brand}`.trim());
  }

  if (searchParams.seasonality) {
    const currentSearch = params.get('search') || '';
    params.set('search', `${currentSearch} ${searchParams.seasonality}`.trim());
  }

  if (searchParams.manufacturer && searchParams.manufacturer !== searchParams.brand) {
    const currentSearch = params.get('search') || '';
    params.set('search', `${currentSearch} ${searchParams.manufacturer}`.trim());
  }

  // Переходим сразу на вкладку товаров (tab=0)
  params.set('tab', '0');

  return `${baseUrl}?${params.toString()}`;
};