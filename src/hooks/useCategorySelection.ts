import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetServicePostsQuery } from '../api/servicePoints.api';
import { useGetServiceCategoriesQuery } from '../api/serviceCategories.api';
import { ServiceCategory } from '../components/ui/CategorySelectionModal';
import { ServicePoint, ServicePost } from '../types/models';

export interface ServicePointForCategorySelection {
  id: number;
  name: string;
  city?: {
    id: number;
    name: string;
  };
}

export interface UseCategorySelectionReturn {
  isModalOpen: boolean;
  selectedServicePoint: ServicePointForCategorySelection | null;
  availableCategories: ServiceCategory[];
  isLoadingCategories: boolean;
  openCategorySelection: (servicePoint: ServicePointForCategorySelection) => void;
  closeCategorySelection: () => void;
  handleCategorySelect: (category: ServiceCategory) => void;
}

export const useCategorySelection = (): UseCategorySelectionReturn => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Состояния
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePointForCategorySelection | null>(null);

  // Загружаем посты сервисной точки для проверки доступности категорий
  const { data: servicePostsData, isLoading: isLoadingPosts } = useGetServicePostsQuery(
    selectedServicePoint?.id.toString() || '',
    { skip: !selectedServicePoint?.id }
  );

  // Загружаем все категории для получения названий
  const { data: categoriesResponse } = useGetServiceCategoriesQuery({});

  // Получаем категории на основе активных постов (независимо от услуг)
  const availableCategories = useMemo(() => {
    if (!servicePostsData || !categoriesResponse?.data) return [];
    
    // Получаем список категорий, для которых есть активные посты
    const activeCategoryIds = new Set<number>();
    servicePostsData.forEach((post: ServicePost) => {
      if (post.is_active && post.service_category_id) {
        activeCategoryIds.add(post.service_category_id);
      }
    });
    
    console.log('🔧 Активные категории постов:', Array.from(activeCategoryIds));
    
    const categoriesMap = new Map();
    
    // Создаем категории на основе активных постов
    Array.from(activeCategoryIds).forEach(categoryId => {
      const categoryInfo = categoriesResponse.data.find(cat => cat.id === categoryId);
      if (categoryInfo) {
        // Подсчитываем количество активных постов для этой категории
        const postsCount = servicePostsData.filter(
          (post: ServicePost) => post.is_active && post.service_category_id === categoryId
        ).length;
        
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryInfo.name,
          description: categoryInfo.description,
          services_count: postsCount,
          services: []
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [servicePostsData, categoriesResponse?.data]);

  // Обработчики
  const openCategorySelection = useCallback((servicePoint: ServicePointForCategorySelection) => {
    console.log('🎯 Открытие выбора категории для:', servicePoint);
    setSelectedServicePoint(servicePoint);
    setIsModalOpen(true);
  }, []);

  const closeCategorySelection = useCallback(() => {
    setIsModalOpen(false);
    setSelectedServicePoint(null);
  }, []);

  const handleCategorySelect = useCallback((category: ServiceCategory) => {
    if (!selectedServicePoint) return;
    
    console.log('🎯 Категория выбрана:', category);
    console.log('📍 Данные сервисной точки:', selectedServicePoint);
    
    const navigationData = { 
      servicePointId: selectedServicePoint.id,
      cityId: selectedServicePoint.city?.id,
      cityName: selectedServicePoint.city?.name,
      service_category_id: category.id,
      step1Completed: true, // Указываем что первый шаг уже завершен
      startFromDateTimeStep: true // Флаг для прямого перехода на шаг выбора даты и времени
    };
    
    console.log('🎯 Навигация к /client/booking/new-with-availability с данными:', navigationData);
    
    // Переходим на форму бронирования с предзаполненными данными (как в ServicePointDetailPage)
    navigate('/client/booking', {
      state: navigationData
    });
    
    // Закрываем модальное окно
    closeCategorySelection();
  }, [selectedServicePoint, navigate, closeCategorySelection]);



  // Обработка категорий после загрузки постов
  useEffect(() => {
    if (selectedServicePoint && !isLoadingPosts) {
      console.log('📋 Посты загружены для точки:', selectedServicePoint.name, {
        categoriesCount: availableCategories.length,
        categories: availableCategories.map(c => c.name)
      });
      
      if (availableCategories.length === 0) {
        console.warn('⚠️ Нет доступных категорий услуг для точки:', selectedServicePoint.name);
        // Всё равно показываем модальное окно с сообщением об отсутствии категорий
        setIsModalOpen(true);
      } else if (availableCategories.length === 1) {
        console.log('📍 Только одна категория, прямой переход:', availableCategories[0]);
        handleCategorySelect(availableCategories[0]);
        return;
      } else {
        // Несколько категорий - показываем модальное окно для выбора
        console.log('📋 Открываем модальное окно выбора категории');
        setIsModalOpen(true);
      }
    }
  }, [selectedServicePoint, availableCategories, isLoadingPosts, handleCategorySelect]);

  return {
    isModalOpen,
    selectedServicePoint,
    availableCategories,
    isLoadingCategories: isLoadingPosts,
    openCategorySelection,
    closeCategorySelection,
    handleCategorySelect
  };
}; 