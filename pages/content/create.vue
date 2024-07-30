<template>
  <Title>登录</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              上传新内容
            </CardTitle>
            <CardDescription>
              上传图片或视频以显示到食堂显示屏上
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="email">内容名</Label>
                <Input
                  id="username"
                  v-model="form.name"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="category">类型</Label>
                <Input
                  id="category"
                  v-model="category"
                  type="radio"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="duration">显示时长（秒）</Label>
                <Input
                  id="duration"
                  v-model="form.duration"
                  type="number"
                  max="90"
                  min="0"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="lifespan">有效期（天）</Label>
                <Input
                  id="lifespan"
                  v-model="form.lifespan"
                  type="number"
                  max="180"
                  min="0"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="filepath">文件</Label>
                <Input
                  id="filepath"
                  type="file"
                  max="180"
                  min="0"
                  required
                />
              </div>
              <Button v-if="!isPending" type="submit" class="w-full" @click="loginMutation(form)">
                登录
              </Button>
              <Button v-if="isPending" type="submit" class="w-full" disabled>
                <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

const { $api } = useNuxtApp();

const filePath = ref('');
const category = ref('');
const form = reactive({
  name: '',
  ownerId: 0,
  duration: 0,
  fileType: '',
  S3FileId: '',
  lifespan: 0,
  state: 'created',
  categoryId: '',
});

const { mutate: createMutation, isPending } = useMutation({
  mutationFn: $api.content.create.mutate,
  onSuccess: () => toast.success('内容创建成功'),
  onError: err => useErrorHandler(err),
});
function createContent() {

};
</script>
