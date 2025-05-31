<template>
  <Title>失物招领</Title>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              失物招领
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="email">物品名</Label>
                <Input
                  id="username"
                  v-model="form.name"
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
              <Button v-if="!isUploading" type="submit" class="w-full" @click="createLnfContent">
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
import type { AxiosProgressEvent } from 'axios';
import axios from 'axios';
import { CalendarIcon, Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
} from '@internationalized/date';
import { ref } from 'vue';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { makeId } from '~/server/trpc/utils/shared';

const { $api } = useNuxtApp();

const value = ref<DateValue>();

// 定义df为日期格式化工具，将 Date 对象转换为特定格式的字符串
// 参数含义：full  2024年1月1日星期一
//          long  2024年1月1日
//          medium 2024年1月1日
//          short  2024/1/1
const df = new DateFormatter('zh-CN', {
  dateStyle: 'long',
});

interface Form {
  name: string;
  ownerId: number;
  duration: number;
  fileType: string;
  S3FileId: string;
  expireDate: Date;
  categoryId: number;
  fingerprint: string;
  date: Date;
};
const form: Form = reactive({
  name: '',
  ownerId: 0, // 与lnf用户关联的代码放在controller里了
  duration: 90, // 指定一个统一的失物招领信息展示时间,暂为90s
  fileType: '',
  S3FileId: '',
  expireDate: new Date(),
  categoryId: 0,
  fingerprint: '',
  date: new Date(),
});

const allowed_types = new Set(['image']); // 一个 Set 集合,检查文件的主类型是否合法。

const { mutate: createMutation } = useMutation({
  mutationFn: $api.content.createLostnfound.mutate,
  onSuccess: () => toast.success('内容创建成功'),
  onError: err => useErrorHandler(err),
});
const { files, open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*',
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
      toast.error('只能上传图片');
    }
  }
});

const progress = ref(0);
const isUploading = ref(false);
// 创建用户浏览器指纹
async function makeFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
async function createLnfContent() {
  if (!form.name) {
    toast.error('未填写物品名');
    return;
  }
  if (!value.value) {
    toast.error('请选择截止日期');
    return;
  }
  if (!files.value) {
    toast.error('未选择文件');
    return;
  }
  form.fingerprint = await makeFingerprint();
  form.expireDate = value.value.toDate(getLocalTimeZone());
  form.S3FileId = `${makeId(20)}|file-${files.value[0].name}`;
  try {
    const uploadURL = await $api.s3.getLnfUploadURL.query({ s3FileId: form.S3FileId });
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
  } catch (err: any) {
    toast('上传失败');
    useErrorHandler(err);
    isUploading.value = false;
    return;
  }
  createMutation(form);
  isUploading.value = false;
};
</script>
