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
                <Popover v-model:open="open">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="open"
                      class="w-24"
                    >
                      选择类型
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[200px] p-2">
                    <Command>
                      <CommandInput class="h-9" placeholder="Search framework..." />
                      <CommandEmpty>请选择类型</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            v-for="pool in categoryList"
                            :key="pool.id"
                            :value="pool.id"
                            @select="(ev: any) => {
                              if (typeof ev.detail.value === 'number')
                                form.categoryId = ev.detail.value
                              open = false;
                            }"
                          >
                            {{ pool.category }}
                            <Check
                              v-if="form.categoryId === pool.id"
                              class="ml-auto h-4 w-4"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <div class="flex p-2">
                  <Button variant="outline" @click="openFileDialog">
                    选择文件
                  </Button>
                  <div class="p-2 w-48 truncate">
                    <Label v-if="files">{{ files[0].name }}</Label>
                    <Label v-else>未选择文件</Label>
                  </div>
                </div>
              </div>
              <Button v-if="!isPending" type="submit" class="w-full" @click="createContent">
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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import axios from 'axios';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const { $api } = useNuxtApp();

const form = reactive({
  name: '',
  ownerId: 0,
  duration: 0,
  fileType: '',
  S3FileId: '',
  lifespan: 0,
  state: 'created',
  categoryId: 0,
});

const img_types = new Set([
  'jfif',
  'pjpeg',
  'jpeg',
  'pjp',
  'jpg',
  'png',
]);
const video_types = new Set([
  'm4v',
  'mp4',
]);
const { data: categoryList } = useQuery({
  queryKey: ['pool.list'],
  queryFn: () => $api.pool.list.query(),
});
const { mutate: createMutation, isPending } = useMutation({
  mutationFn: $api.content.create.mutate,
  onSuccess: () => toast.success('内容创建成功'),
  onError: err => useErrorHandler(err),
});
const { files, open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*,video/*',
  multiple: false,
  directory: false,
});
onChange((filelist: FileList | null) => {
  if (filelist) {
    const extname = filelist[0].name.split('.')[-1];
    if (img_types.has(extname)) {
      form.fileType = 'image';
    } else if (video_types.has(extname)) {
      form.fileType = 'video';
    } else {
      reset();
      toast.error('只能上传图片或视频');
    }
  }
});

function createContent() {
  if (!files.value) {
    toast.error('未选择文件');
    return;
  }
  form.lifespan = form.lifespan * 86400;
};
</script>
