<template>
  <div class="h-screen flex bg-gray-10 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <!-- User Profile Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span class="text-lg font-semibold text-gray-70 dark:text-gray-200">
              {{ authStore.user?.first_name?.charAt(0) || authStore.user?.phone_number?.charAt(0) || '?' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ authStore.user?.first_name || authStore.user?.phone_number }}
            </p>
            <p class="text-xs text-gray-50 dark:text-gray-400 truncate">
              {{ authStore.user?.is_online ? 'В сети' : 'Не в сети' }}
            </p>
          </div>
          <button @click="toggleTheme" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 0 1-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 1a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-3">
        <div class="relative">
          <input
            type="text"
            placeholder="Поиск..."
            class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-2">
          <div 
            v-for="chat in chats" 
            :key="chat.id"
            class="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3"
            @click="selectChat(chat)"
          >
            <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span class="text-lg font-semibold text-gray-70 dark:text-gray-200">
                {{ chat.title?.charAt(0) || 'C' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ chat.title || 'Без названия' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">Последнее сообщение...</p>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">12:45</div>
          </div>
        </div>
      </div>

      <!-- Bottom Menu -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between">
          <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button @click="logout" class="p-2 rounded-full hover:bg-gray-20 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex-col">
      <!-- Chat Header -->
      <div class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {{ selectedChat?.title?.charAt(0) || 'C' }}
            </span>
          </div>
          <div>
            <p class="font-medium">{{ selectedChat?.title || 'Выберите чат' }}</p>
            <p class="text-xs text-gray-50 dark:text-gray-400">в сети</p>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div v-if="selectedChat" class="space-y-3">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['max-w-xs md:max-w-md lg:max-w-lg', message.sender_id === authStore.user?.id ? 'ml-auto' : '']"
          >
            <div 
              :class="[
                'p-3 rounded-2xl',
                message.sender_id === authStore.user?.id 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              ]"
            >
              <p>{{ message.content }}</p>
              <p class="text-xs mt-1 opacity-70">{{ formatDate(message.created_at) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p>Выберите чат для начала общения</p>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="selectedChat" class="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4">
        <input
          v-model="newMessage"
          @keypress.enter="sendMessage"
          type="text"
          placeholder="Написать сообщение..."
          class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button @click="sendMessage" class="ml-3 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.78 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Mock data - in real app this would come from API
const chats = ref([
 { id: '1', title: 'Телеграм Клон' },
  { id: '2', title: 'Админ Панель' },
  { id: '3', title: 'Разработка' }
]);

const messages = ref([
  { id: '1', content: 'Привет! Как дела?', sender_id: '1', created_at: new Date() },
  { id: '2', content: 'Отлично! Работаем над клоном Телеграма', sender_id: '2', created_at: new Date() }
]);

const selectedChat = ref<any>(null);
const newMessage = ref('');

const selectChat = (chat: any) => {
  selectedChat.value = chat;
  // In real app, fetch messages for this chat
};

const sendMessage = () => {
 if (newMessage.value.trim() === '') return;
  
  // In real app, send message via API
  messages.value.push({
    id: Date.now().toString(),
    content: newMessage.value,
    sender_id: authStore.user?.id || '',
    created_at: new Date()
  });
  
  newMessage.value = '';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const toggleTheme = () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
 } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
 }
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
 }
});
</script>
