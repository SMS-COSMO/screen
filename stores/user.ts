import { defineStore } from 'pinia';
import type { TRole, TUserLogin, TUserModify } from '~/types';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref<number>();
  const username = ref('');
  const userDescription = ref('');
  const role = ref<TRole>('club');

  const login = (data: TUserLogin) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;

    userId.value = data.id;
    username.value = data.username;
    userDescription.value = (data.description != null) ? data.description : "还没有介绍哦~";
    //null暂未明确处理方式

    role.value = data.role;
  };

  //modify方法用于在刷新用户资料同时不重新登录
  const modify = (data: TUserModify) => {
    username.value = data.username;
    userDescription.value = (data.description != null) ? data.description : "还没有介绍哦~";
  }

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = undefined;
    username.value = '';
    userDescription.value = '';

    role.value = 'club';
  };

  return {
    loggedIn,
    accessToken,
    refreshToken,
    userId,
    username,
    userDescription,
    role,
    login,
    modify,
    logout,
  };
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
