import { UserRole } from '../types/user-role';

// Функция для преобразования role_id в enum UserRole
export const getRoleFromId = (roleId: number): UserRole => {
  switch (roleId) {
    case 1: return UserRole.ADMIN;
    case 2: return UserRole.MANAGER;
    case 3: return UserRole.OPERATOR;
    case 4: return UserRole.PARTNER;
    case 5: return UserRole.CLIENT;
    default: return UserRole.CLIENT;
  }
};

// Функция для преобразования строки роли в role_id
export const getRoleId = (role: string): number => {
  switch (role) {
    case 'admin': return 1;
    case 'manager': return 2;
    case 'operator': return 3;
    case 'partner': return 4;
    case 'client': return 5;
    default: return 5;
  }
};
