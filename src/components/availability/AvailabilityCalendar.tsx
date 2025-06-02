// components/availability/AvailabilityCalendar.tsx
// Календарь доступности с отображением загрузки по дням

import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetWeekOverviewQuery } from '../../api/availability.api';
import type { WeekDayOverview } from '../../types/availability';

interface AvailabilityCalendarProps {
  servicePointId: string | number;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  className?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  servicePointId,
  selectedDate = new Date(),
  onDateSelect,
  minDate = new Date(),
  className = ''
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const { data: weekData, isLoading, error } = useGetWeekOverviewQuery({
    servicePointId,
    params: { start_date: format(currentWeekStart, 'yyyy-MM-dd') }
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const getOccupancyColor = (occupancy?: number): string => {
    if (!occupancy && occupancy !== 0) return 'bg-gray-100';
    if (occupancy < 30) return 'bg-green-100 text-green-800';
    if (occupancy < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getOccupancyText = (occupancy?: number): string => {
    if (!occupancy && occupancy !== 0) return 'Недоступно';
    return `${Math.round(occupancy)}% занято`;
  };

  const isDayDisabled = (date: Date): boolean => {
    return isBefore(date, minDate);
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-500 ${className}`}>
        Ошибка загрузки данных календаря
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Заголовок с навигацией */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Предыдущая неделя"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold">
          {format(currentWeekStart, 'd MMMM', { locale: ru })} - {' '}
          {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: ru })}
        </h3>
        
        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Следующая неделя"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 border-b">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
          <div key={index} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Календарная сетка */}
      <div className="grid grid-cols-7">
        {weekData?.days.map((dayData: WeekDayOverview, index) => {
          const date = addDays(currentWeekStart, index);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const isDisabled = isDayDisabled(date);
          const occupancy = dayData.summary?.occupancy_percentage;

          return (
            <button
              key={dayData.date}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                p-3 h-24 border-r border-b transition-all duration-200
                flex flex-col items-center justify-center text-sm
                ${isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}
                ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
                ${isCurrentDay && !isSelected ? 'bg-blue-50' : ''}
                ${!dayData.is_working ? 'bg-gray-100' : ''}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mb-1
                ${isCurrentDay ? 'bg-blue-500 text-white' : ''}
                ${isSelected && !isCurrentDay ? 'bg-blue-600 text-white' : ''}
              `}>
                {format(date, 'd')}
              </div>
              
              {dayData.is_working ? (
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${getOccupancyColor(occupancy)}
                `}>
                  {getOccupancyText(occupancy)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  Не работает
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 