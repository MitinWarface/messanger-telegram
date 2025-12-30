<template>
  <div class="h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <!-- Admin Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <span class="text-lg font-semibold text-white">A</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">Админ Панель</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">+7991816358</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="p-3">
        <nav class="space-y-1">
          <button
            @click="setActiveTab('dashboard')"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'dashboard'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-1l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 01-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01 1m-6 0h6" />
            </svg>
            <span>Дашборд</span>
          </button>
          
          <button
            @click="setActiveTab('users')"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'users'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Пользователи</span>
          </button>
          
          <button
            @click="setActiveTab('chats')"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'chats'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Чаты</span>
          </button>
          
          <button
            @click="setActiveTab('messages')"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'messages'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 01-2 2z" />
            </svg>
            <span>Сообщения</span>
          </button>
          
          <button
            @click="activeTab = 'sms'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'sms' 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20l9-9-9 9 9 9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20l9-9-9 9 9 9z" />
            </svg>
            <span>SMS Логи</span>
          </button>
          
          <button
            @click="activeTab = 'actions'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2',
              activeTab === 'actions' 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 0 02 2h2a2 2 0 002-2M9 5a2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Действия</span>
          </button>
        </nav>
      </div>

      <!-- Bottom Menu -->
      <div class="mt-auto p-3 border-t border-gray-200 dark:border-gray-700">
        <button @click="logout" class="w-full p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Выход</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex-col overflow-y-auto">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">Админ Дашборд</h1>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h2 class="text-lg font-semibold">Пользователи</h2>
                <p class="text-2xl font-bold">{{ stats.users.total }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-green-100 dark:bg-green-90/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.02 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h2 class="text-lg font-semibold">Активные</h2>
                <p class="text-2xl font-bold">{{ stats.users.active }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-yellow-10 dark:bg-yellow-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.95 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                </svg>
              </div>
              <div class="ml-4">
                <h2 class="text-lg font-semibold">Заблокированные</h2>
                <p class="text-2xl font-bold">{{ stats.users.banned }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div class="ml-4">
                <h2 class="text-lg font-semibold">Сообщения</h2>
                <p class="text-2xl font-bold">{{ stats.messages.recent }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow mb-6">
          <h2 class="text-xl font-semibold mb-4">Недавняя активность</h2>
          <div class="space-y-3">
            <div v-for="action in stats.admin.recentActions" :key="action.id" class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4 flex-1">
                <p class="font-medium">{{ action.action_type }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ new Date(action.created_at).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">Управление пользователями</h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-50 dark:text-gray-300 uppercase tracking-wider">Имя</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Номер</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {{ user.first_name?.charAt(0) || user.phone_number?.charAt(0) || '?' }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.first_name || 'Без имени' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.phone_number }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      user.is_banned ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                      user.is_online ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    ]"
                  >
                    {{ user.is_banned ? 'Заблокирован' : user.is_online ? 'В сети' : 'Не в сети' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    v-if="!user.is_banned"
                    @click="banUser(user.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-3"
                  >
                    Заблокировать
                  </button>
                  <button 
                    v-else
                    @click="unbanUser(user.id)"
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                  >
                    Разблокировать
                  </button>
                  <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    Подробнее
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Chats Tab -->
      <div v-if="activeTab === 'chats'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">Управление чатами</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="chat in chats"
            :key="chat.id"
            class="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <div class="flex items-center mb-3">
              <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {{ chat.title?.charAt(0) || 'C' }}
                </span>
              </div>
              <div class="ml-3">
                <h3 class="font-medium">{{ chat.title || 'Без названия' }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ chat.type }}</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Участников: {{ chat.users?.length || 0 }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Создан: {{ new Date(chat.created_at).toLocaleDateString() }}</p>
            </div>
            <div class="mt-4 flex space-x-2">
              <button class="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                Подробнее
              </button>
              <button class="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Tab -->
      <div v-if="activeTab === 'messages'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">Сообщения</h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Отправитель</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Сообщение</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Чат</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="message in messages" :key="message.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ message.sender_id }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ message.content }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ message.chat_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-40">{{ new Date(message.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SMS Logs Tab -->
      <div v-if="activeTab === 'sms'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">SMS Логи</h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Номер</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Сообщение</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="log in smsLogs" :key="log.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ log.phone_number }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ log.message }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      log.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    ]"
                  >
                    {{ log.status === 'sent' ? 'Отправлено' : 'Ошибка' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(log.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions Tab -->
      <div v-if="activeTab === 'actions'" class="p-6">
        <h1 class="text-2xl font-bold mb-6">Административные действия</h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Админ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действие</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Цель</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="action in adminActions" :key="action.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ action.admin_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ action.action_type }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ action.target_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(action.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Define interfaces for type safety
interface User {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  is_banned: boolean;
  is_online: boolean;
}

interface Chat {
  id: string;
  title?: string;
  type: string;
  created_at: Date;
  users?: any[];
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  chat_id: string;
  created_at: Date;
}

interface SmsLog {
  id: string;
  phone_number: string;
  message: string;
  status: string;
  created_at: Date;
}

interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_id?: string;
  created_at: Date;
}

interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    admin: number;
  };
  messages: {
    recent: number;
  };
  admin: {
    recentActions: AdminAction[];
  };
}

// Define type for active tab to fix TypeScript errors
type ActiveTab = 'dashboard' | 'users' | 'chats' | 'messages' | 'sms' | 'actions';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref<ActiveTab>('dashboard');

// Method to set active tab to fix TypeScript errors
const setActiveTab = (tab: ActiveTab) => {
  activeTab.value = tab;
};

// Define reactive variables with proper types
const stats = ref<AdminStats>({
  users: {
    total: 0,
    active: 0,
    banned: 0,
    admin: 0
  },
  messages: {
    recent: 0
  },
  admin: {
    recentActions: []
  }
});

const users = ref<User[]>([]);
const chats = ref<Chat[]>([]);
const messages = ref<Message[]>([]);
const smsLogs = ref<SmsLog[]>([]);
const adminActions = ref<AdminAction[]>([]);

const loadStats = async () => {
  // In real app, fetch stats from API
  stats.value = {
    users: {
      total: 156,
      active: 42,
      banned: 3,
      admin: 1
    },
    messages: {
      recent: 234
    },
    admin: {
      recentActions: [
        { id: '1', action_type: 'user_banned', admin_id: '1', created_at: new Date() },
        { id: '2', action_type: 'broadcast_sent', admin_id: '1', created_at: new Date() },
        { id: '3', action_type: 'user_unbanned', admin_id: '1', created_at: new Date() }
      ]
    }
  };
};

const loadUsers = async () => {
  // In real app, fetch users from API
  users.value = [
    { id: '1', phone_number: '+79918816358', first_name: 'Admin', is_banned: false, is_online: true },
    { id: '2', phone_number: '+79991234567', first_name: 'John', is_banned: false, is_online: false },
    { id: '3', phone_number: '+79997654321', first_name: 'Jane', is_banned: true, is_online: false }
  ];
};

const loadChats = async () => {
  // In real app, fetch chats from API
  chats.value = [
    { id: '1', title: 'Телеграм Клон', type: 'group', created_at: new Date() },
    { id: '2', title: 'Разработка', type: 'group', created_at: new Date() },
    { id: '3', title: 'Админ Панель', type: 'private', created_at: new Date() }
  ];
};

const loadMessages = async () => {
  // In real app, fetch messages from API
  messages.value = [
    { id: '1', sender_id: '1', content: 'Привет всем!', chat_id: '1', created_at: new Date() },
    { id: '2', sender_id: '2', content: 'Как дела?', chat_id: '2', created_at: new Date() }
  ];
};

const loadSmsLogs = async () => {
  // In real app, fetch SMS logs from API
  smsLogs.value = [
    { id: '1', phone_number: '+7991816358', message: 'Код: 1234', status: 'sent', created_at: new Date() },
    { id: '2', phone_number: '+79991234567', message: 'Код: 5678', status: 'sent', created_at: new Date() }
  ];
};

const loadAdminActions = async () => {
  // In real app, fetch admin actions from API
  adminActions.value = [
    { id: '1', admin_id: '1', action_type: 'user_banned', target_id: '2', created_at: new Date() },
    { id: '2', admin_id: '1', action_type: 'broadcast_sent', created_at: new Date() }
  ];
};

const banUser = async (userId: string) => {
  // In real app, call API to ban user
  console.log('Banning user:', userId);
  await loadUsers(); // Refresh user list
};

const unbanUser = async (userId: string) => {
  // In real app, call API to unban user
  console.log('Unbanning user:', userId);
  await loadUsers(); // Refresh user list
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.user?.is_admin) {
    router.push('/');
  } else {
    loadStats();
    loadUsers();
    loadChats();
    loadMessages();
    loadSmsLogs();
    loadAdminActions();
  }
});
</script>
