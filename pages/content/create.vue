<template>
  <Title>上传内容</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              上传内容
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
                <Popover v-model:open="unfoldCheckbox">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="unfoldCheckbox"
                      class="flex w-full justify-between"
                    >
                      <p>
                        {{ checkedCategory ? checkedCategory : '选择类型' }}
                      </p>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[200px] p-2">
                    <Command>
                      <CommandEmpty>请选择类型</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            v-for="pool in categoryList"
                            :key="pool.id"
                            :value="pool.id"
                            @select="(ev: any) => {
                              if (typeof ev.detail.value === 'number') {
                                form.categoryId = ev.detail.value;
                                checkedCategory = pool.category;
                              }
                              unfoldCheckbox = false;
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
                  v-model="lifespan"
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
              <Progress v-if="isUploading" v-model="progress" />
              <Button v-if="!isUploading" type="submit" class="w-full" @click="createContent">
                创建内容
              </Button>
              <Button v-if="isUploading" type="submit" class="w-full" disabled>
                <Loader2 v-if="isUploading" class="w-4 h-4 mr-2 animate-spin" />
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
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { makeId } from '~/server/trpc/utils/shared';

const { $api } = useNuxtApp();
const userStore = useUserStore();

const unfoldCheckbox = ref(false);
const checkedCategory = ref('');
const lifespan = ref(0);
interface Form {
  name: string;
  ownerId: number;
  duration: number;
  fileType: string;
  S3FileId: string;
  lifespan: number;
  categoryId: number;
};
const form: Form = reactive({
  name: '',
  ownerId: 0,
  duration: 0,
  fileType: '',
  S3FileId: '',
  lifespan: 0,
  categoryId: 0,
});

const allowed_types = new Set(['video', 'image']);
const { data: categoryList } = useQuery({
  queryKey: ['pool.list'],
  queryFn: () => $api.pool.list.query(),
});
const { mutate: createMutation } = useMutation({
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
    const fileType = filelist[0].type;
    if (allowed_types.has(fileType.split('/')[0])) {
      form.fileType = fileType;
    } else {
      reset();
      toast.error('只能上传图片或视频');
    }
  }
});

const progress = ref(0);
const isUploading = ref(false);
async function createContent() {
  if (!files.value) {
    toast.error('未选择文件');
    return;
  }
  form.lifespan = lifespan.value * 86400;
  if (userStore.userId) {
    form.ownerId = userStore.userId;
    form.S3FileId = `${makeId(20)}/user-${userStore.userId}/file-${files.value[0].name}`;
  } else {
    navigateTo('/login');
    return;
  }

  try {
    const uploadURL = await $api.s3.getUploadURL.query({ s3FileId: form.S3FileId });
    const file = files.value[0];
    if (uploadURL) {
      isUploading.value = true;
      await axios.put(uploadURL, file.slice(), {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (p) => {
          progress.value = Math.floor((p.progress ?? 0) * 100);
        },
      });
    }
  } catch (err: any) {
    toast.error(`文件上传失败 ${err}`);
    isUploading.value = false;
    return;
  }

  createMutation(form);
  isUploading.value = false;
};
</script>
