import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserRole } from '../types/user-role';

/**
 * Хук для определения прав доступа пользователя на основе его роли
 */
export const useRoleAccess = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  return useMemo(() => {
    const userRole = user?.role;
    

    
    return {
      // Основные роли
      isAdmin: userRole === UserRole.ADMIN,
      isManager: userRole === UserRole.MANAGER,
      isPartner: userRole === UserRole.PARTNER,
      isOperator: userRole === UserRole.OPERATOR,
      isClient: userRole === UserRole.CLIENT,
      
      // Комбинированные права доступа
      canManageAllData: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManagePartnerData: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER].includes(userRole as UserRole),
      canViewOwnData: [UserRole.PARTNER, UserRole.OPERATOR].includes(userRole as UserRole),
      
      // Права для сервисных точек
      canViewAllServicePoints: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManageAllServicePoints: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManageOwnServicePoints: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER].includes(userRole as UserRole),
      canViewOwnServicePoints: [UserRole.PARTNER, UserRole.OPERATOR].includes(userRole as UserRole),
      
      // Права для бронирований
      canViewAllBookings: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManageAllBookings: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canViewPartnerBookings: [UserRole.PARTNER, UserRole.OPERATOR].includes(userRole as UserRole),
      
      // Права для отзывов
      canViewAllReviews: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManageAllReviews: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canViewPartnerReviews: [UserRole.PARTNER].includes(userRole as UserRole),
      
      // Права для операторов
      canViewAllOperators: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canManageAllOperators: [UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole),
      canViewPartnerOperators: [UserRole.PARTNER].includes(userRole as UserRole),
      canManagePartnerOperators: [UserRole.PARTNER].includes(userRole as UserRole),
      
      // Права для создания
      canCreateServicePoint: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER].includes(userRole as UserRole),
      canCreateOperator: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER].includes(userRole as UserRole),
      
      // Данные пользователя
      user,
      userRole,
      partnerId: user?.partner?.id || (user as any)?.partner_id,
      
      // Отладочная информация
      debugInfo: {
        userExists: !!user,
        partnerExists: !!user?.partner,
        partnerIdFromPartner: user?.partner?.id,
        partnerIdFromUser: (user as any)?.partner_id,
        finalPartnerId: user?.partner?.id || (user as any)?.partner_id
      },
      
      // Утилиты для UI
      getCreateServicePointPath: () => {
        const partnerId = user?.partner?.id || (user as any)?.partner_id;
        if (userRole === UserRole.PARTNER && partnerId) {
          return `/admin/partners/${partnerId}/service-points/new`;
        }
        return '/admin/service-points/new';
      },
      
      getServicePointsPath: () => {
        if (userRole === UserRole.PARTNER) {
          return '/admin/my-service-points';
        }
        return '/admin/service-points';
      },
      
      // Проверка прав для конкретного ресурса
      canEditServicePoint: (servicePoint: { partner_id?: number }) => {
        if ([UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole)) {
          return true;
        }
        const partnerId = user?.partner?.id || (user as any)?.partner_id;
        if (userRole === UserRole.PARTNER && partnerId) {
          return servicePoint.partner_id === partnerId;
        }
        return false;
      },
      
      canDeleteServicePoint: (servicePoint: { partner_id?: number }) => {
        if ([UserRole.ADMIN, UserRole.MANAGER].includes(userRole as UserRole)) {
          return true;
        }
        if (userRole === UserRole.PARTNER && user?.partner?.id) {
          return servicePoint.partner_id === user.partner.id;
        }
        return false;
      }
    };
  }, [user]);
};

/**
 * Хук для получения роли пользователя в читаемом формате
 */
export const useRoleName = () => {
  const { userRole } = useRoleAccess();
  
  return useMemo(() => {
    const roleNames = {
      [UserRole.ADMIN]: 'Администратор',
      [UserRole.MANAGER]: 'Менеджер',
      [UserRole.PARTNER]: 'Партнер',
      [UserRole.OPERATOR]: 'Оператор',
      [UserRole.CLIENT]: 'Клиент'
    };
    
    return roleNames[userRole as UserRole] || 'Пользователь';
  }, [userRole]);
}; 