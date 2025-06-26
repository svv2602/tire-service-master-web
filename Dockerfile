# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем системные зависимости
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false && \
    npm cache clean --force

# Копируем весь код приложения
COPY . .

# Создаем директории для build и node_modules
RUN mkdir -p build node_modules && \
    chmod -R 755 build

# Устанавливаем права доступа
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

# Переключаемся на пользователя приложения
USER appuser

# Открываем порт 3008
EXPOSE 3008

# Команда по умолчанию (может быть переопределена в docker-compose.yml)
CMD ["npm", "start"] 