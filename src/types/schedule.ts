export interface Schedule {
  id: string;
  servicePointId: string;
  date: string;
  slots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: string;
}

export interface ScheduleFormData {
  servicePointId: string;
  date: string;
  slots: TimeSlotFormData[];
}

export interface TimeSlotFormData {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ScheduleFilter {
  servicePointId?: string;
  startDate?: string;
  endDate?: string;
}

// Вспомогательные типы для генерации расписания
export interface GenerateScheduleData {
  servicePointId: string;
  startDate: string;
  endDate: string;
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  slotDuration: number; // в минутах
  excludeDates?: string[]; // даты для исключения
} 