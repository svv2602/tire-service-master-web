# Многоэтапная сборка для React приложения
FROM node:18-alpine AS base

# Устанавливаем системные зависимости
RUN apk update && apk add --no-cache \
    curl \
    git \
    bash

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false

# Копируем исходный код приложения
COPY . .

# Создаем необходимые директории и устанавливаем права
RUN mkdir -p build node_modules && \
    chown -R node:node /app

# Переключаемся на пользователя node (уже существует в образе)
USER node

# Открываем порт
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:3008 || exit 1

# Команда по умолчанию для development
CMD ["npm", "start"] 