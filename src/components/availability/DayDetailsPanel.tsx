// components/availability/DayDetailsPanel.tsx
// Панель с детальной информацией о загрузке дня

import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetDayDetailsQuery } from '../../api/availability.api';

interface DayDetailsPanelProps {
  servicePointId: string | number;
  selectedDate: Date;
  className?: string;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  servicePointId,
  selectedDate,
  className = ''
}) => {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: dayDetails, isLoading, error } = useGetDayDetailsQuery({
    servicePointId,
    date: dateString
  });

  const getOccupancyColor = (percentage: number): string => {
    if (percentage < 30) return 'text-green-600 bg-green-100';
    if (percentage < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHourOccupancyColor = (percentage: number): string => {
    if (percentage === 0) return 'bg-green-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-red-500">Ошибка загрузки данных дня</div>
      </div>
    );
  }

  if (!dayDetails) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Заголовок */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          Загрузка на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {dayDetails.service_point_name}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {!dayDetails.is_working ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">Нерабочий день</div>
            <div className="text-gray-400 text-sm">
              Сервисная точка не работает в этот день
            </div>
          </div>
        ) : (
          <>
            {/* Общая статистика */}
            {dayDetails.summary && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {dayDetails.total_posts}
                  </div>
                  <div className="text-sm text-gray-600">Всего постов</div>
                </div>
                
                <div className={`text-center p-3 rounded-lg ${getOccupancyColor(dayDetails.summary.occupancy_percentage)}`}>
                  <div className="text-2xl font-bold">
                    {Math.round(dayDetails.summary.occupancy_percentage)}%
                  </div>
                  <div className="text-sm">Загрузка дня</div>
                </div>
              </div>
            )}

            {/* Рабочие часы */}
            {dayDetails.working_hours && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Работает с {dayDetails.working_hours.start_time} до {dayDetails.working_hours.end_time}
                </span>
              </div>
            )}

            {/* Детальная статистика */}
            {dayDetails.summary && (
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {dayDetails.summary.available_slots}
                  </div>
                  <div className="text-gray-600">Свободно</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {dayDetails.summary.occupied_slots}
                  </div>
                  <div className="text-gray-600">Занято</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-700">
                    {dayDetails.summary.total_slots}
                  </div>
                  <div className="text-gray-600">Всего слотов</div>
                </div>
              </div>
            )}

            {/* Почасовая загрузка */}
            {dayDetails.hourly_breakdown && dayDetails.hourly_breakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Загрузка по часам</h4>
                <div className="space-y-2">
                  {dayDetails.hourly_breakdown.map((hourData) => (
                    <div key={hourData.hour} className="flex items-center space-x-3">
                      <div className="w-16 text-sm text-gray-600">
                        {String(hourData.hour).padStart(2, '0')}:00
                      </div>
                      
                      <div className="flex-1">
                        <div className="relative bg-gray-200 rounded-full h-3">
                          <div 
                            className={`absolute left-0 top-0 h-3 rounded-full transition-all duration-300 ${getHourOccupancyColor(hourData.occupancy_percentage)}`}
                            style={{ width: `${hourData.occupancy_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="w-20 text-right">
                        <div className="text-sm font-medium">
                          {Math.round(hourData.occupancy_percentage)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {hourData.available_posts}/{hourData.total_posts}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 