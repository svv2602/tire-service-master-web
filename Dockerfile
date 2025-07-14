# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем системные зависимости
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++ \
    ca-certificates

# Создаем пользователя приложения
#RUN addgroup -g 1000 -S appgroup && \
#    adduser -u 1000 -S appuser -G appgroup

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
#COPY --chown=appuser:appgroup package*.json ./

# Устанавливаем зависимости
RUN npm ci  && \
    npm cache clean --force

# Копируем весь проект
COPY --chown=root:root . .

# Создаем директории с правильными правами
#RUN mkdir -p node_modules/.cache && \
#    chown -R appuser:appgroup node_modules

# Переключаемся на непривилегированного пользователя
USER root

# Открываем порт
EXPOSE 3008

# Добавляем health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:3008 || exit 1

# Команда запуска (для dev — npm start, для prod — можно заменить на serve -s build)
CMD ["npm", "start"]


