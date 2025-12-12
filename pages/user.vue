<template>
  <Title>用户信息</Title>
  <div class="mx-auto w-[800px] grid gap-4 md:grid-cols-2 lg:grid-cols-1">
    <Card class="relative">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-2xl font-bold">
          {{ store.username }}
        </CardTitle>
        <button class="absolute right-4 top-4" @click="$router.go(-1)">
          <ArrowLeft class="h-6 w-6" />
        </button>
      </CardHeader>
      <CardContent class="grid gap-4">
        <p class="text-xs text-gray-400">
          {{ store.userDescription }}
        </p>
        <Card v-if="modifyBoardExpanded && modifyChoice === 'info'">
          <CardHeader>
            <CardTitle>
              用户资料设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="email">用户名</Label>
                <Input
                  id="username"
                  v-model="Info.username"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="email">用户信息</Label>
                <Input
                  id="description"
                  v-model="Info.description"
                  required
                />
              </div>
              <div class="flex gap-4">
                <button class="w-full h-8 bg-transparent rounded border" @click="modifyBoardExpanded = !modifyBoardExpanded">
                  取消修改
                </button>
                <button v-if="!isInfoPending" class="w-full h-8 bg-blue-600 text-white rounded border" @click="toggle_confirm()">
                  保存修改
                </button>
                <Button v-if="isInfoPending" type="submit" class="w-full" disabled @click="toggle_confirm()">
                  <Loader2 v-if="isInfoPending" class="w-4 h-4 mr-2 animate-spin" />
                  请稍候……
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card v-if="modifyBoardExpanded && modifyChoice === 'password'">
          <CardHeader>
            <CardTitle>
              密码设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="password">旧密码</Label>
                <Input
                  id="password"
                  v-model="Password.oldPassword"
                  type="password"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="password">新密码</Label>
                <Input
                  id="password"
                  v-model="Password.newPassword"
                  type="password"
                  required
                />
              </div>
              <div class="flex gap-4">
                <button class="w-full h-8 bg-transparent rounded border" @click="modifyBoardExpanded = !modifyBoardExpanded, clearPasswordCache()">
                  取消修改
                </button>
                <button v-if="!isPasswordPending" class="w-full h-8 bg-blue-600 text-white rounded border" @click="toggle_confirm()">
                  保存修改
                </button>
                <Button v-if="isPasswordPending" type="submit" class="w-full" disabled @click="toggle_confirm()">
                  <Loader2 v-if="isPasswordPending" class="w-4 h-4 mr-2 animate-spin" />
                  请稍候……
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div class="flex gap-4">
          <button v-if="!modifyBoardExpanded" class="w-full h-8 rounded border" @click="modifyBoardExpanded = true, modifyChoice = 'info' ">
            修改用户资料
          </button>
          <button v-if="!modifyBoardExpanded" class="w-full h-8 rounded border" @click="modifyBoardExpanded = true, modifyChoice = 'password'">
            修改密码
          </button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang = "ts">
import { ArrowLeft, Loader2, RollerCoaster } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { ref } from 'vue';
import guestBlocker from '~/middleware/blockers/guest-blocker';

definePageMeta({
  layout: false,
  middleware: [ guestBlocker, 'dynamic-layout' ],
});

const modifyBoardExpanded = ref(false);

const { $api } = useNuxtApp();
const store = useUserStore();
const queryClient = useQueryClient();

const modifyChoice = ref('');
const userStore = useUserStore();
const Info = reactive({
  id: store.userId ?? 0,
  username: store.username ?? '',
  description: store.userDescription ?? '',
});

const Password = reactive({
  id: store.userId !== undefined ? store.userId : 0,
  oldPassword: '',
  newPassword: '',
});

const { mutate: modifyInfoMutation, isPending: isInfoPending } = useMutation({
  mutationFn: $api.user.modifyUserInfo.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    store.modify(Info);
    toast.success('修改成功');
  },
  onError: err => useErrorHandler(err),
});

const { mutate: modifyPasswordMutation, isPending: isPasswordPending } = useMutation({
  mutationFn: $api.user.modifyPassword.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    toast.success('修改成功');
    clearPasswordCache();
  },
  onError: (err) => {
    useErrorHandler(err);
    clearPasswordCache();
  },
});

/* if (userStore.role === 'admin') {
  setPageLayout('default');
} else if (userStore.role === 'club') {
  setPageLayout('club');
}
definePageMeta({
  layout: false,
}); */

function toggle_confirm() {
  try {
    if (modifyChoice.value === 'info')
      modifyInfoMutation(Info);
    else if (modifyChoice.value === 'password')
      modifyPasswordMutation(Password);
    modifyBoardExpanded.value = false;
  } catch (err) {
    return false;
  }
}

// 清除输入框中的内容
function clearPasswordCache() {
  Password.oldPassword = '';
  Password.newPassword = '';
}
</script>
