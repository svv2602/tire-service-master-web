import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetSuspensionInfoQuery, type SuspensionInfo } from '../../../api/users.api';

interface SuspensionStatusChipProps {
  userId: number;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  showTooltip?: boolean;
  onClick?: () => void;
}

export const SuspensionStatusChip: React.FC<SuspensionStatusChipProps> = ({
  userId,
  variant = 'filled',
  size = 'small',
  showTooltip = true,
  onClick,
}) => {
  const { 
    data: suspensionData, 
    isLoading, 
    error 
  } = useGetSuspensionInfoQuery(userId);

  const suspensionInfo: SuspensionInfo | null = suspensionData?.data || null;

  // Если загружается или ошибка
  if (isLoading) {
    return (
      <Chip
        label="..."
        size={size}
        variant={variant}
        color="default"
      />
    );
  }

  if (error || !suspensionInfo) {
    return (
      <Chip
        label="Ошибка"
        size={size}
        variant={variant}
        color="error"
      />
    );
  }

  // Определяем статус и цвет
  const isSuspended = suspensionInfo.is_suspended;
  const isExpired = suspensionInfo.suspended_until && 
                   new Date(suspensionInfo.suspended_until) <= new Date();

  let label: string;
  let color: 'success' | 'error' | 'warning' | 'default';
  let icon: string;

  if (!isSuspended) {
    label = 'Активен';
    color = 'success';
    icon = '✅';
  } else if (isExpired) {
    label = 'Истёк срок';
    color = 'warning';
    icon = '⏰';
  } else if (suspensionInfo.is_permanent) {
    label = 'Заблокирован';
    color = 'error';
    icon = '🔒';
  } else {
    // Временная блокировка
    const daysRemaining = suspensionInfo.days_remaining || 0;
    if (daysRemaining > 0) {
      label = `${daysRemaining} дн.`;
      color = 'error';
      icon = '⏳';
    } else {
      label = 'Сегодня';
      color = 'warning';
      icon = '⚠️';
    }
  }

  // Создаем tooltip контент
  const tooltipContent = isSuspended ? (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        Пользователь заблокирован
      </Typography>
      <Typography variant="body2">
        <strong>Причина:</strong> {suspensionInfo.reason || 'Не указана'}
      </Typography>
      {suspensionInfo.suspended_at && (
        <Typography variant="body2">
          <strong>Заблокирован:</strong>{' '}
          {format(new Date(suspensionInfo.suspended_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
        </Typography>
      )}
      {suspensionInfo.suspended_by && (
        <Typography variant="body2">
          <strong>Кем:</strong> {suspensionInfo.suspended_by}
        </Typography>
      )}
      {suspensionInfo.is_permanent ? (
        <Typography variant="body2">
          <strong>Срок:</strong> Постоянная блокировка
        </Typography>
      ) : suspensionInfo.suspended_until ? (
        <Typography variant="body2">
          <strong>До:</strong>{' '}
          {format(new Date(suspensionInfo.suspended_until), 'dd.MM.yyyy HH:mm', { locale: ru })}
        </Typography>
      ) : null}
    </Box>
  ) : (
    <Typography variant="body2">
      Пользователь активен и может пользоваться системой
    </Typography>
  );

  const chip = (
    <Chip
      label={`${icon} ${label}`}
      size={size}
      variant={variant}
      color={color}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          opacity: 0.8,
        } : {},
      }}
    />
  );

  if (!showTooltip) {
    return chip;
  }

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      enterDelay={500}
      leaveDelay={200}
    >
      {chip}
    </Tooltip>
  );
}; 