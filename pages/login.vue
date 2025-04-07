<template>
  <Title>登录</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center text-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              登录
            </CardTitle>
            <CardDescription>
              欢迎来到显示屏管理系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="email">用户名</Label>
                <Input
                  id="username"
                  v-model="form.username"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="password">密码</Label>
                <Input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                />
              </div>
              <Button v-if="!isPending" type="submit" class="w-full" @click="loginMutation(form)">
                登录
              </Button>
              <Button v-if="isPending" type="submit" class="w-full" disabled @click="loginMutation(form)">
                <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </div>
            <br>
            <a href="/register" class="text-sm text-gray-500 hover:underline hover:text-white">没有帐号？请注册</a>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { onKeyPressed } from '@vueuse/core';

const { $api } = useNuxtApp();
const userStore = useUserStore();

const form = reactive({
  username: '',
  password: '',
});

const { mutate: loginMutation, isPending } = useMutation({
  mutationFn: $api.user.login.mutate,
  onSuccess: (res) => {
    userStore.login(res);
    navigateTo('/');
    toast.success('登录成功');
  },
  onError: err => useErrorHandler(err),
});

onKeyPressed('Enter', () => loginMutation(form));
</script>
