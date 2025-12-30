# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем корневой package.json если он существует
COPY package.json ./

# Устанавливаем зависимости для корня (если они есть), игнорируем ошибки если package-lock.json отсутствует
RUN npm ci --only=production --no-audit --no-fund || echo "No root dependencies to install"

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем зависимости для backend и собираем его
WORKDIR /app/backend
COPY backend/package.json ./
COPY backend/package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

# Устанавливаем TypeScript глобально для компиляции
RUN npm install -g typescript

# Копируем исходный код backend и tsconfig
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Компилируем TypeScript backend
RUN npm run build

# Устанавливаем зависимости для frontend и собираем его
WORKDIR /app/frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

# Копируем исходные файлы frontend перед сборкой
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src

# Копируем файлы с правильной разметкой
COPY frontend/src/assets/css/tailwind.css ./src/assets/css/

# Исправляем проблему с разметкой в ChatView.vue
RUN sed -i 's/<\/div>\n        <div v-else/<\/div>\n        <\/div>\n        <div v-else/g' src/views/ChatView.vue

RUN ls -la && npm run build

# Убедимся, что собранные frontend файлы доступны из правильного места
# Возвращаемся в корневую директорию
WORKDIR /app

# Указываем команду запуска
CMD ["sh", "-c", "cd backend && npm start"]