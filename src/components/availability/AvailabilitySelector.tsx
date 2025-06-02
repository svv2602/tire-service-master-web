// components/availability/AvailabilitySelector.tsx
// Главный компонент для выбора доступности

import React, { useState } from 'react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { DayDetailsPanel } from './DayDetailsPanel';

interface AvailabilitySelectorProps {
  servicePointId: string | number;
  selectedDate?: Date;
  selectedTime?: string;
  onDateTimeSelect: (date: Date, time?: string) => void;
  minDuration?: number;
  showDetails?: boolean;
  className?: string;
}

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  servicePointId,
  selectedDate,
  selectedTime,
  onDateTimeSelect,
  minDuration = 60,
  showDetails = true,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [currentTime, setCurrentTime] = useState<string | undefined>(selectedTime);

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setCurrentTime(undefined); // Сбрасываем время при смене даты
    onDateTimeSelect(date, undefined);
  };

  const handleTimeSelect = (time: string) => {
    setCurrentTime(time);
    onDateTimeSelect(currentDate, time);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Календарь для выбора даты */}
      <div>
        <AvailabilityCalendar
          servicePointId={servicePointId}
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          minDate={new Date()}
        />
      </div>

      {/* Сетка с выбором времени и деталями */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Выбор временных слотов */}
        <div className="lg:col-span-2">
          <TimeSlotPicker
            servicePointId={servicePointId}
            selectedDate={currentDate}
            selectedTime={currentTime}
            onTimeSelect={handleTimeSelect}
            minDuration={minDuration}
          />
        </div>

        {/* Панель с деталями дня */}
        {showDetails && (
          <div className="lg:col-span-1">
            <DayDetailsPanel
              servicePointId={servicePointId}
              selectedDate={currentDate}
            />
          </div>
        )}
      </div>

      {/* Итоговая информация о выборе */}
      {currentTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-blue-800">
              <span className="font-medium">Выбранное время:</span>{' '}
              {currentDate.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} в {currentTime}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 