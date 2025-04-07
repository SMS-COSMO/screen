<template>
  <Title>注册</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center text-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              注册
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
              <div class="grid gap-2">
                <Label for="password">确认密码</Label>
                <Input
                  id="password"
                  v-model="cpassword"
                  type="password"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="password">邀请码</Label>
                <Input
                  id="invitation"
                  v-model="form.ic"
                  type="password"
                  required
                />
              </div>
              <Button v-if="!isPending" type="submit" class="w-full" @click="toggle_confirm()">
                注册
              </Button>
              <Button v-if="isPending" type="submit" class="w-full" disabled @click="toggle_confirm()">
                <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </div>
            <br>
            <a href="/login" class="text-sm text-gray-500 hover:underline hover:text-white">已有帐号？请登录</a>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>





<script setup lang = "ts">

import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { ref } from 'vue';

const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const note = ref('');
const cpassword = ref('');

const form = reactive({
  username: '',
  password: '',
  ic: '',
  role: <'club'> 'club'
});

const { mutate: registMutation, isPending: isPending } = useMutation({
  mutationFn: $api.user.register.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    invalidateMutation({code: form.ic})//切换邀请码状态
    toast.success('注册成功');
  },
  onError: err => useErrorHandler(err),
})

const { mutate: invalidateMutation } = useMutation({
  mutationFn: $api.invitationCode.invalidateCode.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invitation'] });
  },
  onError: err => useErrorHandler(err),
})

function toggle_confirm(){
  if(form.password != cpassword.value){
    cpassword.value = '';
    toast.error('请重新确认密码');
  }
  else{
    note.value = '';
    registMutation(form);
    console.log(form.ic);
  }
}

</script>