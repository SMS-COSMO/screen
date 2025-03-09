<template>
  <Tabs default-value="content" class="w-full">
    <div class="flex justify-center">
      <TabsList class="grid w-1/2 grid-cols-2">
        <TabsTrigger value="content">
          内容管理
        </TabsTrigger>
        <TabsTrigger value="category">
          内容类型管理
        </TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="content">
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
                          class="opacity-35 flex-initial w-5 text-right
                          "
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
                            v-if="!isPending2"
                            type="submit"
                            @click="editContentNameMutation({ id: content.id, new_name: edit_new_content_name })"
                          >
                            确认修改
                          </Button>
                          <Button v-if="isPending3" type="submit" disabled>
                            <Loader2 v-if="isPending3" class="w-4 h-4 mr-2 animate-spin" />
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
                  <!-- 由于部分问题,待修复 -->
                  {{ content.ownerId }}
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
                        <HandleDisplay :src-key="content.S3FileId" />
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
                    <!-- { `bg-[${TransState(content.state).color}]` }}{ -->
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
                        <div class="grid grid-cols-4 items-center gap-2 grid-rows-6">
                          <Checkbox
                            class="col-span-1 row-span-1 ml-[2vw]"
                            @update:checked="(newVal: any) => isPassExa = newVal"
                          />
                          <Label for="c-name" class="text-center col-span-2 row-span-1">
                            是否过审
                          </Label>
                          <Label v-show="!isPassExa" for="c-name" class="row-span-1 col-span-4 text-left ml-4">
                            修改意见
                          </Label>
                          <Textarea v-show="!isPassExa" v-model="exa_idea" class="row-span-4 col-span-4" />
                        </div>
                      </div>
                      <DialogClose>
                        <Button
                          v-if="!isPending2"
                          type="submit"
                          @click="editExaState()"
                        >
                          确认
                        </Button>
                        <Button v-if="isPending3" type="submit" disabled>
                          <Loader2 v-if="isPending3" class="w-4 h-4 mr-2 animate-spin" />
                          请稍候……
                        </Button>
                        <Button
                          type="submit"
                          class="ml-6 bg-slate-50"
                        >
                          取消
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
    </TabsContent>
    <TabsContent value="category">
      <div class="flex justify-center">
        <Card class="w-[500px]">
          <CardHeader>
            <CardTitle>内容类型管理</CardTitle>
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="outline" class="ml-auto">
                  创建内容类型
                </Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>请输入内容类型名称</DialogTitle>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-7 items-center gap-4">
                    <Label for="location" class="col-span-2">
                      内容类型名称
                    </Label>
                    <Input id="location" v-model="name" class="col-span-5" />
                  </div>
                </div>
                <DialogClose>
                  <Button v-if="!isPending" type="submit" @click="createPoolMutation({ category: name })">
                    创建内容类型
                  </Button>
                  <Button v-if="isPending" type="submit" disabled>
                    <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                    请稍候……
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent class="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-20">
                    内容类型id
                  </TableHead>
                  <TableHead class="w-64">
                    内容类型名称
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="pool in categoryList" :key="pool.id">
                  <TableCell>
                    {{ pool.id }}
                  </TableCell>
                  <TableCell>
                    <div class="flex">
                      <p class="w-48 truncate">
                        {{ pool.category }}
                      </p>
                      <Dialog>
                        <DialogTrigger as-child>
                          <Pencil
                            class="opacity-35 flex-initial w-5 text-right"
                            :size="12"
                          />
                        </DialogTrigger>
                        <DialogContent class="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>请输入新的内容类型名</DialogTitle>
                          </DialogHeader>
                          <div class="grid gap-4 py-4">
                            <div class="grid grid-cols-7 items-center gap-4">
                              <Label for="name" class="col-span-2">
                                内容类型名称
                              </Label>
                              <Input id="name" v-model="edit_new_category_name" class="col-span-5" />
                            </div>
                          </div>
                          <DialogClose>
                            <Button
                              v-if="!isPending2"
                              type="submit"
                              @click="editPoolMutation({ id: pool.id, new_category: edit_new_category_name })"
                            >
                              确认修改
                            </Button>
                            <Button v-if="isPending2" type="submit" disabled>
                              <Loader2 v-if="isPending2" class="w-4 h-4 mr-2 animate-spin" />
                              请稍候……
                            </Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger as-child>
                          <Trash2
                            class="opacity-35 flex-initial w-5 text-right"
                            :size="12"
                          />
                        </DialogTrigger>
                        <DialogContent class="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>确认删除内容类型？</DialogTitle>
                          </DialogHeader>
                          <DialogClose>
                            <div class="flex gap-7 justify-center">
                              <Button
                                type="submit"
                                @click="deletePoolMutation({ id: pool.id })"
                              >
                                确认
                              </Button>
                              <Button variant="outline">
                                取消
                              </Button>
                            </div>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { BookmarkCheck, Loader2, Pencil, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Badge from '~/components/ui/Badge.vue';
import HandleDisplay from '~/components/ui/DisplayBox/HandleDisplay.vue';
import Textarea from '~/components/ui/textarea/Textarea.vue';

// 以下为前朝遗物
const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const { data: contentList, suspense } = useQuery({
  queryKey: ['content', 'list'],
  queryFn: () => $api.content.list.query(),
});
const { data: categoryList } = useQuery({
  queryKey: ['pool', 'list'],
  queryFn: () => $api.pool.list.query(),
});
await suspense();

const name = ref('');
const edit_new_category_name = ref('');
const { mutate: createPoolMutation, isPending } = useMutation({
  mutationFn: $api.pool.create.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pool', 'list'] });
    toast.success('内容类型创建成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: deletePoolMutation } = useMutation({
  mutationFn: $api.pool.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pool', 'list'] });
    toast.success('内容类型删除成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: editPoolMutation, isPending: isPending2 } = useMutation({
  mutationFn: $api.pool.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pool', 'list'] });
    toast.success('修改内容类型名成功');
  },
  onError: err => useErrorHandler(err),
});

const edit_new_content_name = ref('');
const { mutate: deleteContentMutation } = useMutation({
  mutationFn: $api.content.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
    toast.success('内容删除成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: editContentNameMutation, isPending: isPending3 } = useMutation({
  mutationFn: $api.content.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
    toast.success('修改内容名成功');
  },
  onError: err => useErrorHandler(err),
});
// 以上是类型管理
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

// 以下为审核意见功能块
const exa_idea: Ref<string> = ref('');
const isPassExa: Ref<boolean> = ref(false);

function editExaState() {
  // 后台接口未实现-----------------待实现
  toast.success('审核提交成功');
}
// 测试函数
</script>
