import { defineStore } from 'pinia';
import type { TRole, TUserLogin } from '~/types';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref('');
  const username = ref('');
  const role = ref<TRole>('club');

  const login = (data: TUserLogin) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    userId.value = data.id;
    username.value = data.username;
    role.value = data.role;
  };

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = '';
    username.value = '';

    role.value = 'club';
  };

  return {
    loggedIn,
    accessToken,
    refreshToken,
    userId,
    username,
    role,
    login,
    logout,
  };
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
