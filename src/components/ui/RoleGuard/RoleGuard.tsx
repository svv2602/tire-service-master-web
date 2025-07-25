import React from 'react';
import { useUserRole, type UserPermissions } from '../../../hooks/useUserRole';

interface RoleGuardProps {
  children: React.ReactNode;
  // Разрешенные роли
  allowedRoles?: Array<'admin' | 'partner' | 'operator' | 'manager' | 'client'>;
  // Требуемые права доступа
  requiredPermissions?: Array<keyof UserPermissions>;
  // Функция для кастомной проверки доступа
  customCheck?: (permissions: UserPermissions) => boolean;
  // Компонент для отображения при отсутствии доступа
  fallback?: React.ReactNode;
  // Показывать ли fallback или просто скрывать
  showFallback?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  customCheck,
  fallback = null,
  showFallback = false,
}) => {
  const permissions = useUserRole();

  // Проверка по ролям
  const hasAllowedRole = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;

    return allowedRoles.some(role => {
      switch (role) {
        case 'admin':
          return permissions.isAdmin;
        case 'partner':
          return permissions.isPartner;
        case 'operator':
          return permissions.isOperator;
        case 'manager':
          return permissions.isManager;
        case 'client':
          return permissions.isClient;
        default:
          return false;
      }
    });
  }, [allowedRoles, permissions]);

  // Проверка по правам доступа
  const hasRequiredPermissions = React.useMemo(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    return requiredPermissions.every(permission => Boolean(permissions[permission]));
  }, [requiredPermissions, permissions]);

  // Кастомная проверка
  const passesCustomCheck = React.useMemo(() => {
    if (!customCheck) return true;
    return customCheck(permissions);
  }, [customCheck, permissions]);

  // Итоговая проверка доступа
  const hasAccess = hasAllowedRole && hasRequiredPermissions && passesCustomCheck;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};

// Компонент для админов
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для партнеров
export const PartnerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['partner']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для операторов
export const OperatorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['operator']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для менеджеров
export const ManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['manager']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для клиентов
export const ClientOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['client']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для административных ролей (админы и менеджеры)
export const AdminOrManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['admin', 'manager']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для ролей с правами управления операторами
export const CanManageOperators: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard requiredPermissions={['canManageOperators']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
);

// Компонент для ролей с доступом к аудиту
export const CanViewAuditLogs: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard requiredPermissions={['canViewAuditLogs']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </RoleGuard>
); 