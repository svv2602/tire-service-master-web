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

# Создаем пользователя с нестандартным UID
#ARG UID=0
#ARG GID=0

#RUN addgroup -g ${GID} appgroup && \
#    adduser -D -u ${UID} -G appgroup appuser

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci && npm cache clean --force

# Копируем весь проект
COPY . .

# Меняем владельца всех файлов на appuser
#RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER root

# Открываем порт
EXPOSE 3008

# Команда запуска (для dev — npm start, для prod — можно заменить на serve -s build)
CMD ["npm", "start"]


