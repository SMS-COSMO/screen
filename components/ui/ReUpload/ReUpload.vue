<!-- 封装一个重新上传的按钮 -->
<!-- 已弃用 -->
<template>
  <div>
    <Dialog>
      <DialogTrigger as-child>
        <Button variant="outline">
          重新上传
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[94vw] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>重新上传文件</DialogTitle>
        </DialogHeader>
        <div>
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
        </div>
        <DialogClose>
          <Button type="submit">
            取消
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const { files, open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*,video/*',
  multiple: false,
  directory: false,
});

// 表单
interface Form {
  name: string;
  ownerId: number;
  duration: number;
  fileType: string;
  S3FileId: string;
  expireDate: Date;
  categoryId: number;
};
const form: Form = reactive({
  name: '',
  ownerId: 0,
  duration: 0,
  fileType: '',
  S3FileId: '',
  expireDate: new Date(),
  categoryId: 0,
});

// 类型检查
const allowed_types = new Set(['video', 'image']);
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

// 上传函数
function submit() {
  if (!files.value) {
    toast.error('未选择文件');
    return;
  }
}
</script>

<style scoped>
</style>
