// components/availability/TimeSlotPicker.tsx
// Компонент для выбора временного слота с отображением доступности

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetAvailableTimesQuery, useGetNextAvailableTimeQuery } from '../../api/availability.api';
import type { AvailableTimeSlot } from '../../types/availability';

interface TimeSlotPickerProps {
  servicePointId: string | number;
  selectedDate: Date;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  minDuration?: number;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  servicePointId,
  selectedDate,
  selectedTime,
  onTimeSelect,
  minDuration = 60,
  className = ''
}) => {
  const [showNextAvailable, setShowNextAvailable] = useState(false);
  
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { 
    data: availabilityData, 
    isLoading, 
    error 
  } = useGetAvailableTimesQuery({
    servicePointId,
    params: {
      date: dateString,
      min_duration_minutes: minDuration
    }
  });

  const {
    data: nextAvailableData,
    isLoading: isNextLoading
  } = useGetNextAvailableTimeQuery({
    servicePointId,
    params: {
      date: dateString,
      duration_minutes: minDuration
    }
  }, {
    skip: !showNextAvailable || (availabilityData?.available_times.length || 0) > 0
  });

  // Показываем поиск следующего доступного времени если нет слотов
  useEffect(() => {
    if (availabilityData && availabilityData.available_times.length === 0) {
      setShowNextAvailable(true);
    }
  }, [availabilityData]);

  const getSlotStatusColor = (slot: AvailableTimeSlot): string => {
    if (!slot.can_book) return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    
    const availabilityRatio = slot.available_posts / slot.total_posts;
    if (availabilityRatio > 0.7) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (availabilityRatio > 0.3) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
  };

  const getSlotStatusText = (slot: AvailableTimeSlot): string => {
    if (!slot.can_book) return 'Недоступно';
    return `${slot.available_posts} из ${slot.total_posts} постов`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 p-4 bg-red-50 rounded-lg ${className}`}>
        Ошибка загрузки временных слотов
      </div>
    );
  }

  const hasAvailableSlots = availabilityData && availabilityData.available_times.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Доступное время на {format(selectedDate, 'd MMMM', { locale: ru })}
        </h4>
        {availabilityData && (
          <span className="text-sm text-gray-500">
            {availabilityData.total_intervals} интервалов
          </span>
        )}
      </div>

      {hasAvailableSlots ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availabilityData.available_times.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.can_book && onTimeSelect(slot.time)}
              disabled={!slot.can_book}
              className={`
                p-3 rounded-lg border transition-all duration-200 text-sm
                flex flex-col items-center justify-center
                ${selectedTime === slot.time ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                ${getSlotStatusColor(slot)}
              `}
            >
              <div className="font-medium mb-1">{slot.time}</div>
              <div className="text-xs text-center">
                {getSlotStatusText(slot)}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            Свободных слотов на эту дату нет
          </div>
          
          {showNextAvailable && (
            <div className="bg-blue-50 p-4 rounded-lg">
              {isNextLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Поиск ближайшего времени...</span>
                </div>
              ) : nextAvailableData?.found ? (
                <div className="text-center">
                  <div className="text-sm text-blue-800 mb-2">
                    Ближайшее доступное время:
                  </div>
                  <div className="font-medium text-blue-900 mb-2">
                    {format(new Date(nextAvailableData.next_available!.date), 'd MMMM', { locale: ru })} в {nextAvailableData.next_available!.time}
                  </div>
                  <div className="text-xs text-blue-700">
                    {nextAvailableData.next_available!.available_posts} постов доступно
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {nextAvailableData?.message || 'Свободное время не найдено в ближайшие 30 дней'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>Много мест</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
          <span>Ограниченно</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-100 rounded"></div>
          <span>Мало мест</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Недоступно</span>
        </div>
      </div>
    </div>
  );
}; 