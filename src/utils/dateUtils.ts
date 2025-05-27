// Функция для форматирования даты и времени
export const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  
  // Форматирование даты в формате "DD.MM.YYYY"
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Форматирование времени в формате "HH:MM"
  const formattedTime = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    date: formattedDate,
    time: formattedTime
  };
}; 