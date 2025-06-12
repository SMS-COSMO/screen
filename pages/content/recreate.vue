<template>
  <Title>重新上传内容</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              重新上传内容
            </CardTitle>
            <CardDescription>
              修改原本上传的内容, 将会使审核状态变为"初创建"
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
                            v-for="pool in filteredCategoryList"
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
                <Label for="expireDate">选择截止日期</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="cn(
                        'w-[280px] justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                      )"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ value ? df.format(value.toDate(getLocalTimeZone())) : "选择日期" }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar
                      v-model="value"
                      initial-focus
                      :min-value="today(getLocalTimeZone())"
                    />
                  </PopoverContent>
                </Popover>
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
              <Button v-if="!isUploading" type="submit" class="w-full" @click="recreateContent">
                确定修改
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
import type { AxiosProgressEvent } from 'axios';
import axios from 'axios';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Route, Router, Underline } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
} from '@internationalized/date';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const { $api } = useNuxtApp();
const userStore = useUserStore();

definePageMeta({
  layout: false,
  middleware: 'dynamic-layout',
});

const uId = useUserStore().userId; // userId 存储在 store 中
if (!uId) {
  toast.error('用户ID未找到');
  navigateTo('/login');
}

const unfoldCheckbox = ref(false);
const checkedCategory = ref('');
const value = ref<DateValue>();

// 定义df为日期格式化工具，将 Date 对象转换为特定格式的字符串
// 参数含义：full  2024年1月1日星期一
//          long  2024年1月1日
//          medium 2024年1月1日
//          short  2024/1/1
const df = new DateFormatter('zh-CN', {
  dateStyle: 'long',
});

// 查询
const queryClient = useQueryClient();

// 获取内容id
const route = useRoute();
const ctId = Number(route.query.ctId);

// 获取自己的accessToken, 待检验
const accessToken = useUserStore().accessToken;

if (!accessToken) {
  toast.error('请先登录');
  navigateTo('/login');
}

interface Form {
  name: string;
  ownerId: number;
  duration: number;
  fileType: string;
  S3FileId: string;
  expireDate: Date;
  categoryId: number;
};

// 获取内容信息
function queryFn() {
  if (!uId) {
    throw new Error('用户ID未找到');
  }
  return $api.content.getContentById.query({ id: ctId });
}

// 使用 queryFn 进行查询内容, 经测试, 似乎不会查询到权限外的?
const { data: contentInfo, suspense } = useQuery({
  queryKey: ['content', 'getContentById'],
  queryFn,
});
await suspense();

// 防止越权访问
const { data: isAuth, suspense: isAuth_suspense } = useQuery({
  queryKey: ['user', 'checkAccessToken'],
  // 注意, 此处uid与uId有不同
  queryFn: () => {
    // 切记要返回, 不然报错很令人疑惑, 找了好久
    return $api.user.checkAccessToken.query({ accessToken: accessToken!, uid: uId! });
  },
});
await isAuth_suspense();
if (!isAuth.value) {
  toast.error('内容不存在');
  navigateTo('/content/club');
}

const form: Form = reactive({
  name: contentInfo.value?.name || '',
  ownerId: contentInfo.value?.ownerId || 0,
  duration: contentInfo.value?.duration || 0,
  fileType: contentInfo.value?.fileType || '',
  S3FileId: contentInfo.value?.S3FileId || '',
  expireDate: contentInfo.value?.expireDate ? new Date(contentInfo.value.expireDate) : new Date(),
  categoryId: contentInfo.value?.categoryId || 0,
});

const allowed_types = new Set(['video', 'image']);
const { data: categoryList } = useQuery({
  queryKey: ['pool', 'list'],
  queryFn: () => $api.pool.list.query(),
});

// 过滤内容类型，只显示用户有权限选择的内容类型
const filteredCategoryList = computed(() => {
  if (!categoryList.value)
    return [];
  return categoryList.value.filter(pool => pool.roleRequirement === 'club' || userStore.role === 'admin');
});

// 修改函数
const { mutate: updateMutation } = useMutation({
  mutationFn: $api.content.updateContent.mutate,
  onSuccess: () => toast.success('内容修改成功'),
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

// 删除文件函数
const { mutate: deleteMutation } = useMutation({
  mutationFn: $api.s3.deleteFile.mutate,
  onSuccess: () => {
    toast.success('内容删除成功');
  },
  onError: err => useErrorHandler(err),
});

const progress = ref(0);
const isUploading = ref(false);
async function recreateContent() {
  if (!files.value) {
    toast.error('未选择文件');
    return;
  }
  if (form.duration > 90) {
    toast.error('内容展示时长不能超过90秒');
    return;
  }
  if (form.duration <= 0) {
    toast.error('内容展示时长必须是正值');
    return;
  }
  if (!value.value) {
    toast.error('请选择截止日期');
    return;
  }
  form.expireDate = value.value.toDate(getLocalTimeZone());

  // 校验选择的内容类型是否符合权限要求
  const selectedCategory = categoryList.value?.find(pool => pool.id === form.categoryId);
  if (selectedCategory && selectedCategory.roleRequirement !== 'club' && userStore.role !== 'admin') {
    toast.error('您没有权限选择该类型的内容');
    return;
  }

  try {
    // 暂存旧文件, 遵循先上传再删除原则
    const oldFileId = contentInfo.value?.S3FileId;

    // 重新生成fileid
    if (userStore.userId) {
      form.ownerId = userStore.userId;
      form.S3FileId = `${makeId(20)}|user-${userStore.userId}|file-${files.value[0].name}`;
    } else {
      navigateTo('/login');
      return;
    }

    // 准备上传新文件
    // 这里的 S3FileId 是一个随机生成的 ID，格式为 {makeId(20)}|user-{userId}|file-{file.name}
    const uploadURL = await $api.s3.getUploadURL.query({ s3FileId: form.S3FileId });
    const file = files.value[0];
    if (uploadURL) {
      isUploading.value = true;
      await axios.put(uploadURL, file.slice(), {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (p: AxiosProgressEvent) => {
          progress.value = Math.floor((p.progress ?? 0) * 100);
        },
      });
    }
    // 如果有旧文件，删除旧文件, 从而避免上传报错而导致空文件指针(即fileId)
    if (oldFileId) {
      await deleteMutation({ s3FileId: oldFileId });
    }
  } catch (err: any) {
    useErrorHandler(err);
    isUploading.value = false;
    return;
  }
  // 更新数据
  updateMutation({
    newContent: { id: ctId, createdAt: new Date(), state: 'created', ...form },
    accessToken: accessToken!,
  });
  isUploading.value = false;

  // 返回原来的页面
  queryClient.invalidateQueries({ queryKey: ['content'] });
  navigateTo('/content/club');
};
</script>
