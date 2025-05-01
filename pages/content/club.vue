<template>
  <Card>
    <CardHeader>
      <CardTitle>内容管理</CardTitle>
    </CardHeader>
    <CardContent class="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              内容id
            </TableHead>
            <TableHead class="w-64">
              内容名称
            </TableHead>
            <TableHead>
              创建者
            </TableHead>
            <TableHead>
              创建时间
            </TableHead>
            <TableHead>
              源文件
            </TableHead>
            <TableHead>
              审核状态
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="content in contentList" :key="content.id">
            <TableCell>
              {{ content.id }}
            </TableCell>
            <TableCell>
              <div class="flex">
                <p class="w-48 truncate">
                  {{ content.name }}
                </p>
                <Dialog>
                  <DialogTrigger as-child>
                    <!-- 徽章样式剪切板 -->
                    <Pencil
                      class="opacity-35 flex-initial w-5 text-right"
                      :size="12"
                    />
                  </DialogTrigger>
                  <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>请输入新的内容名</DialogTitle>
                    </DialogHeader>
                    <div class="grid gap-4 py-4">
                      <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="c-name" class="text-right">
                          内容名称
                        </Label>
                        <Input id="c-name" v-model="edit_new_content_name" class="col-span-3" />
                      </div>
                    </div>
                    <DialogClose>
                      <Button
                        v-if="!isPendingContentEdit"
                        type="submit"
                        @click="editContentNameMutation({ id: content.id, new_name: edit_new_content_name })"
                      >
                        确认修改
                      </Button>
                      <Button v-if="isPendingContentEdit" type="submit" disabled>
                        <Loader2 v-if="isPendingContentEdit" class="w-4 h-4 mr-2 animate-spin" />
                        请稍候……
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
                <Trash2
                  class="opacity-35 flex-initial w-5 text-right"
                  :size="12"
                  @click="deleteContentMutation({ id: content.id })"
                />
              </div>
            </TableCell>
            <TableCell>
              {{ content.owner }}
            </TableCell>
            <TableCell>
              {{ content.createdAt.toLocaleDateString() }}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger as-child>
                  <Button variant="outline">
                    查看
                  </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[94vw] sm:max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>源文件预览</DialogTitle>
                  </DialogHeader>
                  <div>
                    <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType" />
                  </div>
                  <DialogClose>
                    <Button type="submit">
                      返回
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </TableCell>
            <TableCell class="flex justify-left mt-2">
              <Badge :variant="TransState(content.state).color">
                {{ TransState(content.state).text }}
              </Badge>
              <Dialog>
                <DialogTrigger as-child>
                  <!-- 现在是审核按钮 -->
                  <BookmarkCheck
                    class="opacity-35 flex-initial w-5 text-right mt-1"
                    :size="16"
                  />
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>审核意见</DialogTitle>
                  </DialogHeader>
                  <div class="grid gap-4 py-4">
                    <!-- 仅显示审核状态 -->
                    <div class="flex flex-col gap-2 py-2">
                      <div class="w-[100%] flex gap-2 py-[0.5px]">
                        <Label class="text-center col-span-2 row-span-1 py-2">
                          审核状态
                        </Label>
                        <Badge :variant="TransState(content.state).color" class="col-span-2 row-span-1 py-2">
                          {{ TransState(content.state).text }}
                        </Badge>
                      </div>
                      <div v-if="content.reviewNotes" class="flex flex-col gap-4">
                        <Label class="row-span-1 col-span-4 text-left ml-4 py-2">
                          修改意见
                        </Label>
                        <Textarea :model-value="content.reviewNotes" class="row-span-4 col-span-4 ml-2 py-2" readonly />
                      </div>
                    </div>
                  </div>
                  <DialogClose>
                    <Button
                      type="submit"
                    >
                      关闭
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BookmarkCheck, Loader2, Pencil, Trash2 } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { HandleDisplay } from '@/components/ui/DisplayBox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { useUserStore } from '@/stores/user'; // 假设用户信息存储在 user store 中

const userId = useUserStore().userId; // userId 存储在 store 中
const { $api } = useNuxtApp();

const queryClient = useQueryClient();
onMounted(() => {
  if (useUserStore().role === 'admin') {
    useRouter().push('admin'); // 跳转到 admin 页面
  }
});
function queryFn() {
  if (!userId) {
    throw new Error('用户ID未找到');
  }
  return $api.content.getListByOwner.query({ ownerId: userId });
}

// 使用 queryFn 进行查询
const { data: contentList, suspense } = useQuery({
  queryKey: ['content', 'list', userId],
  queryFn,
});
await suspense();
const edit_new_content_name = ref('');
const { mutate: deleteContentMutation } = useMutation({
  mutationFn: $api.content.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
    toast.success('内容删除成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: editContentNameMutation, isPending: isPendingContentEdit } = useMutation({
  mutationFn: $api.content.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
    toast.success('修改内容名成功');
  },
  onError: err => useErrorHandler(err),
});

// 以下是审核状态替换
// enum: ['created', 'approved', 'rejected', 'inuse', 'outdated']
function TransState(state: string): { text: string; color:
  'default' | 'secondary' | 'destructive' |
  'outline' | 'c_created' | 'c_approved' |
  'c_rejected' | 'c_inuse' | 'c_outdated' | null | undefined; } {
  // 事实上 ,null | undefined不会出现
  switch (state) {
    case 'created':
      return { text: '初创建', color: 'c_created' }; // 中性灰
    case 'approved':
      return { text: '已通过', color: 'c_approved' }; // 成功绿
    case 'rejected':
      return { text: '已拒绝', color: 'c_rejected' }; // 错误红
    case 'inuse':
      return { text: '展示中', color: 'c_inuse' }; // 信息蓝
    case 'outdated':
      return { text: '已过期', color: 'c_outdated' }; // 警告黄
    default:
      return { text: '未知状态', color: 'destructive' }; // 组件原生红色
  }
}

// 设置使用club 布局
definePageMeta({
  layout: 'club',
  name: 'club',
});
</script>
