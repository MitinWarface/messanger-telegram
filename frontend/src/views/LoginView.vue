<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Вход в Telegram</h2>
        <p class="mt-2 text-gray-60 dark:text-gray-300">Введите номер телефона для входа</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Номер телефона</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="text-gray-500 dark:text-gray-400">+7</span>
            </div>
            <input
              v-model="phone"
              type="tel"
              id="phone"
              class="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="991-881-63-58"
              required
            />
          </div>
        </div>

        <div v-if="showCodeInput">
          <label for="code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMS код</label>
          <input
            v-model="code"
            type="text"
            id="code"
            class="w-full px-3 py-3 border border-gray-30 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите 4-значный код"
            required
          />
        </div>

        <div class="flex flex-col gap-3">
          <button
            type="submit"
            :disabled="authStore.isLoading || authStore.smsSending"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!authStore.isLoading && !authStore.smsSending">
              {{ showCodeInput ? 'Войти' : 'Отправить код' }}
            </span>
            <span v-else class="flex items-center justify-center">
              <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span class="ml-2">{{ showCodeInput ? 'Вход...' : 'Отправка...' }}</span>
            </span>
          </button>

          <button
            v-if="showCodeInput"
            @click="handleResendCode"
            type="button"
            :disabled="authStore.smsSending"
            class="w-full py-2 px-4 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отправить код повторно
          </button>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const phone = ref('');
const code = ref('');
const error = ref('');

const showCodeInput = computed(() => authStore.smsSent);

const handleSubmit = async () => {
  error.value = '';
  
  try {
    if (!showCodeInput.value) {
      // Send SMS code
      await authStore.sendSMSCode(`+7${phone.value}`);
    } else {
      // Verify SMS code
      await authStore.verifySMSCode(`+7${phone.value}`, code.value);
      
      // Redirect based on admin status
      if (authStore.user?.is_admin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при входе';
    console.error('Login error:', err);
  }
};

const handleResendCode = async () => {
  error.value = '';
  
  try {
    await authStore.sendSMSCode(`+7${phone.value}`);
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при отправке кода';
    console.error('Resend code error:', err);
  }
};
</script>