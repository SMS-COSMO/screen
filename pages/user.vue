<template>
  <Title>用户信息</Title>
  <div class="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-1">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-2xl font-bold">
          {{ store.username }}
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4">
        <p class="text-xs text-gray-400 text-left">
          {{ store.userDescription }}
        </p>
        <Card v-if = "modifyBoardExpanded && modifyChoice === 'info'">
          <CardHeader>
            <CardDescription class="text-xl">
              用户资料设置
            </CardDescription>
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
              <button @click="modifyBoardExpanded = !modifyBoardExpanded" class="w-full h-8 bg-transparent rounded border">
                取消修改
              </button>
              <button v-if = "!isInfoPending" @click="toggle_confirm()" class="w-full h-8 bg-blue-600 text-white rounded border">
                保存修改
              </button>
              <Button v-if="isInfoPending" type="submit" class="w-full" disabled @click="toggle_confirm()">
                <Loader2 v-if="isInfoPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card v-if = "modifyBoardExpanded && modifyChoice === 'password'">
          <CardHeader>
            <CardDescription class="text-xl">
              密码设置
            </CardDescription>
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
              <button @click="modifyBoardExpanded = !modifyBoardExpanded, clearPasswordCache()" class="w-full h-8 bg-transparent rounded border">
                取消修改
              </button>
              <button v-if = "!isPasswordPending" @click="toggle_confirm()" class="w-full h-8 bg-blue-600 text-white rounded border">
                保存修改
              </button>
              <Button v-if="isPasswordPending" type="submit" class="w-full" disabled @click="toggle_confirm()">
                <Loader2 v-if="isPasswordPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </div>
          </CardContent>
        </Card>
        <button v-if = "!modifyBoardExpanded" @click="modifyBoardExpanded = true, modifyChoice = 'info' " class="w-full h-8 rounded border">
        修改用户资料
        </button>
        <button v-if = "!modifyBoardExpanded" @click="modifyBoardExpanded = true, modifyChoice = 'password'" class="w-full h-8 rounded border">
        修改密码
        </button>
      </CardContent>
    </Card>
  </div>
</template>


<script setup lang = "ts">
  import { Loader2, RollerCoaster } from 'lucide-vue-next';
  import { toast } from 'vue-sonner';
  import { ref } from 'vue';

  const modifyBoardExpanded = ref(false);

  const { $api } = useNuxtApp();
  const store = useUserStore();
  const queryClient = useQueryClient();

  const modifyChoice = ref('');

  const Info = reactive({
    id: store.userId !== undefined ? store.userId : 0,
    username: store.username !== undefined ? store.username : "",
    description: store.userDescription !== undefined ? store.userDescription : "",
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
  })

  const { mutate: modifyPasswordMutation, isPending: isPasswordPending } = useMutation({
    mutationFn: $api.user.modifyPassword.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('修改成功');
      clearPasswordCache();
    },
    onError: err => {
      useErrorHandler(err),
      clearPasswordCache();
    }
  })

  function toggle_confirm(){
    try{
      if(modifyChoice.value === 'info'){
        modifyInfoMutation(Info);
      }
      else if(modifyChoice.value === 'password'){
        modifyPasswordMutation(Password); 
      }
      modifyBoardExpanded.value = false;
    } catch (err) {
      return false;
    }
  }

  //清除输入框中的内容
  function clearPasswordCache(){
      Password.oldPassword = "";
      Password.newPassword = "";
  }
</script>