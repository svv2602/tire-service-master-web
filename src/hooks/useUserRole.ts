import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { User } from '../types/user';

export interface UserPermissions {
  isAdmin: boolean;
  isPartner: boolean;
  isOperator: boolean;
  isManager: boolean;
  isClient: boolean;
  canViewAllClients: boolean;
  canViewAllBookings: boolean;
  canViewAllServicePoints: boolean;
  canViewAllOperators: boolean;
  canViewAllReviews: boolean;
  canManageUsers: boolean;
  canManagePartners: boolean;
  canManageOperators: boolean;
  canViewAuditLogs: boolean;
  partnerId?: number;
  operatorId?: number;
  clientId?: number;
  assignedServicePointIds?: number[];
}

export const useUserRole = (): UserPermissions => {
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  return useMemo(() => {
    if (!user) {
      return {
        isAdmin: false,
        isPartner: false,
        isOperator: false,
        isManager: false,
        isClient: false,
        canViewAllClients: false,
        canViewAllBookings: false,
        canViewAllServicePoints: false,
        canViewAllOperators: false,
        canViewAllReviews: false,
        canManageUsers: false,
        canManagePartners: false,
        canManageOperators: false,
        canViewAuditLogs: false,
      };
    }

    const role = user.role?.toLowerCase();
    
    // Определяем базовые роли
    const isAdmin = role === 'admin';
    const isPartner = role === 'partner';
    const isOperator = role === 'operator';
    const isManager = role === 'manager';
    const isClient = role === 'client';

    // Определяем права доступа
    const permissions: UserPermissions = {
      isAdmin,
      isPartner,
      isOperator,
      isManager,
      isClient,

      // Права просмотра всех данных
      canViewAllClients: isAdmin || isManager,
      canViewAllBookings: isAdmin || isManager,
      canViewAllServicePoints: isAdmin || isManager,
      canViewAllOperators: isAdmin || isManager,
      canViewAllReviews: isAdmin || isManager,

      // Права управления
      canManageUsers: isAdmin,
      canManagePartners: isAdmin || isManager,
      canManageOperators: isAdmin || isManager || isPartner,

      // Права аудита
      canViewAuditLogs: isAdmin || isManager,

      // ID связанных сущностей
      partnerId: isPartner ? user.partner?.id : undefined,
      operatorId: isOperator ? user.operator?.id : undefined,
      clientId: isClient ? user.client?.id : undefined,

      // Назначенные сервисные точки (для операторов)
      assignedServicePointIds: isOperator ? user.operator?.service_point_ids : undefined,
    };

    return permissions;
  }, [user]);
};

// Хук для проверки конкретного права
export const useHasPermission = (permission: keyof UserPermissions): boolean => {
  const permissions = useUserRole();
  return Boolean(permissions[permission]);
};

// Хук для проверки доступа к конкретному ресурсу
export const useCanAccessResource = (resourceType: string, resourceId?: number) => {
  const permissions = useUserRole();

  return useMemo(() => {
    // Админы и менеджеры имеют доступ ко всему
    if (permissions.isAdmin || permissions.isManager) {
      return true;
    }

    // Партнеры имеют доступ только к своим ресурсам
    if (permissions.isPartner) {
      switch (resourceType) {
        case 'service_point':
          // Партнер может видеть только свои сервисные точки
          // Здесь нужна дополнительная логика для проверки принадлежности
          return true; // Упрощенная логика
        case 'operator':
          // Партнер может видеть только своих операторов
          return true; // Упрощенная логика
        case 'booking':
        case 'client':
        case 'review':
          // Партнер видит только данные связанные с его точками
          return true; // Упрощенная логика
        default:
          return false;
      }
    }

    // Операторы имеют доступ только к назначенным точкам
    if (permissions.isOperator && permissions.assignedServicePointIds) {
      switch (resourceType) {
        case 'service_point':
          return resourceId ? permissions.assignedServicePointIds.includes(resourceId) : true;
        case 'booking':
        case 'review':
          // Нужна дополнительная логика для проверки принадлежности к назначенным точкам
          return true; // Упрощенная логика
        default:
          return false;
      }
    }

    // Клиенты имеют доступ только к своим данным
    if (permissions.isClient) {
      switch (resourceType) {
        case 'booking':
        case 'review':
          // Клиент видит только свои бронирования и отзывы
          return true; // Упрощенная логика
        default:
          return false;
      }
    }

    return false;
  }, [permissions, resourceType, resourceId]);
};

// Хук для получения параметров фильтрации API
export const useApiFilters = () => {
  const permissions = useUserRole();

  return useMemo(() => {
    const filters: Record<string, any> = {};

    // Если партнер - добавляем фильтр по partner_id
    if (permissions.isPartner && permissions.partnerId) {
      filters.partner_id = permissions.partnerId;
    }

    // Если оператор - добавляем фильтр по service_point_ids
    if (permissions.isOperator && permissions.assignedServicePointIds) {
      filters.service_point_ids = permissions.assignedServicePointIds.join(',');
    }

    // Если клиент - добавляем фильтр по client_id
    if (permissions.isClient && permissions.clientId) {
      filters.client_id = permissions.clientId;
    }

    return filters;
  }, [permissions]);
}; 