# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть) в рабочую директорию
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы проекта в рабочую директорию
COPY . .

# Переходим в директорию backend и устанавливаем зависимости backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./

# Устанавливаем зависимости backend
RUN npm ci

# Устанавливаем TypeScript глобально для компиляции
RUN npm install -g typescript

# Копируем исходный код backend
COPY backend/src ./src
COPY backend/tsconfig.json .

# Компилируем TypeScript
RUN npm run build

# Устанавливаем зависимости для frontend и собираем его
WORKDIR /app

# Сборка фронтенда
RUN cd frontend && npm ci && npm run build

# Устанавливаем все зависимости для продакшена
RUN npm ci --production

# Указываем команду запуска
CMD ["npm", "start"]