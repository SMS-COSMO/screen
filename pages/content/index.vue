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
                  待实现
                </TableCell>
                <TableCell>
                  待实现
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button variant="outline">
                        查看
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>源文件预览</DialogTitle>
                      </DialogHeader>
                      <div>
                        待实现
                      </div>
                      <DialogClose>
                        <Button type="submit">
                          返回
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  待实现
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
import { Loader2, Pencil, Trash2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

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
</script>
