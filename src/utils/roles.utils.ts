// Функция для преобразования role_id в строку роли
export const getRoleFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'admin';
    case 2: return 'manager';
    case 3: return 'partner';
    case 4: return 'operator';
    case 5: return 'client';
    default: return 'client';
  }
};

// Функция для преобразования строки роли в role_id
export const getRoleId = (role: string): number => {
  switch (role) {
    case 'admin': return 1;
    case 'manager': return 2;
    case 'partner': return 3;
    case 'operator': return 4;
    case 'client': return 5;
    default: return 5;
  }
};
