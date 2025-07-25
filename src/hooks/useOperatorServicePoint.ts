import { useState, useEffect, useMemo } from 'react';
import { useGetOperatorServicePointsQuery } from '../api/operators.api';
import { useUserRole } from './useUserRole';

// Типы
interface ServicePoint {
  id: number;
  name: string;
  address: string;
  partner_name?: string;
  is_active: boolean;
  work_status: string;
}

interface UseOperatorServicePointReturn {
  // Доступные точки оператора
  servicePoints: ServicePoint[];
  // Выбранная точка
  selectedPointId: number | null;
  // Функция изменения выбранной точки
  setSelectedPointId: (pointId: number | null) => void;
  // Данные выбранной точки
  selectedPoint: ServicePoint | null;
  // Состояния загрузки
  isLoading: boolean;
  error: any;
  // Проверки
  hasMultiplePoints: boolean;
  isOperator: boolean;
}

const STORAGE_KEY = 'operator_selected_service_point';

export const useOperatorServicePoint = (): UseOperatorServicePointReturn => {
  const { isOperator, operatorId } = useUserRole();
  
  // Состояние выбранной точки (сохраняется в localStorage)
  const [selectedPointId, setSelectedPointIdState] = useState<number | null>(() => {
    if (!isOperator) return null;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });

  // Загрузка доступных точек оператора
  const {
    data: operatorData,
    isLoading,
    error,
  } = useGetOperatorServicePointsQuery({ operatorId: operatorId || 0 }, {
    skip: !isOperator || !operatorId,
  });

  // Обработка данных
  const servicePoints = useMemo(() => {
    if (!operatorData?.data) return [];
    
    return operatorData.data.map((item: any) => ({
      id: item.service_point.id,
      name: item.service_point.name,
      address: item.service_point.address,
      partner_name: item.service_point.partner?.company_name,
      is_active: item.service_point.is_active,
      work_status: item.service_point.work_status,
    }));
  }, [operatorData]);

  // Активные точки
  const activePoints = useMemo(() => 
    servicePoints.filter(point => 
      point.is_active && point.work_status === 'working'
    ), 
    [servicePoints]
  );

  // Выбранная точка
  const selectedPoint = useMemo(() => 
    servicePoints.find(point => point.id === selectedPointId) || null,
    [servicePoints, selectedPointId]
  );

  // Проверка на множественные точки
  const hasMultiplePoints = activePoints.length > 1;

  // Функция изменения выбранной точки
  const setSelectedPointId = (pointId: number | null) => {
    setSelectedPointIdState(pointId);
    
    // Сохраняем в localStorage
    if (pointId) {
      localStorage.setItem(STORAGE_KEY, pointId.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Автоматический выбор точки если она одна
  useEffect(() => {
    if (!isOperator || isLoading || error) return;
    
    // Если есть только одна активная точка и ничего не выбрано
    if (activePoints.length === 1 && !selectedPointId) {
      setSelectedPointId(activePoints[0].id);
      return;
    }
    
    // Если выбранная точка больше не доступна
    if (selectedPointId && !activePoints.find(p => p.id === selectedPointId)) {
      if (activePoints.length > 0) {
        setSelectedPointId(activePoints[0].id);
      } else {
        setSelectedPointId(null);
      }
    }
  }, [isOperator, activePoints, selectedPointId, isLoading, error]);

  // Очистка при смене роли
  useEffect(() => {
    if (!isOperator) {
      setSelectedPointIdState(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isOperator]);

  return {
    servicePoints: activePoints,
    selectedPointId,
    setSelectedPointId,
    selectedPoint,
    isLoading,
    error,
    hasMultiplePoints,
    isOperator,
  };
}; 