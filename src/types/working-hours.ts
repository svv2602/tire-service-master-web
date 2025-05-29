// Определяем тип для рабочих часов
export interface WorkingHours {
  start: string;
  end: string;
  is_working_day: boolean;
}

// Определяем тип для расписания
export interface WorkingHoursSchedule {
  monday: WorkingHours;
  tuesday: WorkingHours;
  wednesday: WorkingHours;
  thursday: WorkingHours;
  friday: WorkingHours;
  saturday: WorkingHours;
  sunday: WorkingHours;
}

// Определяем тип для дня недели
export interface DayOfWeek {
  id: number;
  name: string;
  key: keyof WorkingHoursSchedule;
}

// Константы для дней недели
export const DAYS_OF_WEEK: DayOfWeek[] = [
  { id: 1, name: 'Понедельник', key: 'monday' },
  { id: 2, name: 'Вторник', key: 'tuesday' },
  { id: 3, name: 'Среда', key: 'wednesday' },
  { id: 4, name: 'Четверг', key: 'thursday' },
  { id: 5, name: 'Пятница', key: 'friday' },
  { id: 6, name: 'Суббота', key: 'saturday' },
  { id: 0, name: 'Воскресенье', key: 'sunday' },
];

export const getDayName = (dayOfWeek: number): string => {
  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];
  return days[dayOfWeek % 7];
}; 