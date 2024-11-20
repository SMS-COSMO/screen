<template>
  <Title>节目管理</Title>
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          Total Revenue
        </CardTitle>
        <DollarSign class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          $45,231.89
        </div>
        <p class="text-xs text-muted-foreground">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          Subscriptions
        </CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          +2350
        </div>
        <p class="text-xs text-muted-foreground">
          +180.1% from last month
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          Sales
        </CardTitle>
        <CreditCard class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          +12,234
        </div>
        <p class="text-xs text-muted-foreground">
          +19% from last month
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          Active Now
        </CardTitle>
        <Activity class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          +573
        </div>
        <p class="text-xs text-muted-foreground">
          +201 since last hour
        </p>
      </CardContent>
    </Card>
  </div>
  <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
    <Card class="xl:col-span-2">
      <CardHeader class="flex flex-row items-center">
        <div class="grid gap-2">
          <CardTitle>所有节目</CardTitle>
        </div>
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline" class="ml-auto">
              创建节目
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>创建节目</DialogTitle>
              <DialogDescription>
                请输入节目名称
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">
                  节目名称
                </Label>
                <Input id="name" v-model="name" class="col-span-3" />
              </div>
            </div>
            <DialogClose>
              <Button v-if="!isPending" type="submit" @click="createMutation({ name })">
                创建节目
              </Button>
              <Button v-if="isPending" type="submit" disabled>
                <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                请稍候……
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                节目id
              </TableHead>
              <TableHead class="w-64">
                节目名称
              </TableHead>
              <TableHead>
                创建时间
              </TableHead>
              <TableHead>
                节目内容
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="program in list" :key="program.id">
              <TableCell>
                {{ program.id }}
              </TableCell>
              <TableCell>
                <div class="flex">
                  <p class="w-48">
                    {{ program.name }}
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
                        <DialogTitle>编辑节目名</DialogTitle>
                        <DialogDescription>
                          请输入新的节目名
                        </DialogDescription>
                      </DialogHeader>
                      <div class="grid gap-4 py-4">
                        <div class="grid grid-cols-4 items-center gap-4">
                          <Label for="name" class="text-right">
                            节目名称
                          </Label>
                          <Input id="name" v-model="edit_new_name" class="col-span-3" />
                        </div>
                      </div>
                      <DialogClose>
                        <Button
                          v-if="!isPending"
                          type="submit"
                          @click="editMutation({ id: program.id, new_name: edit_new_name })"
                        >
                          确认修改
                        </Button>
                        <Button v-if="isPending" type="submit" disabled>
                          <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                          请稍候……
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                  <Trash2
                    class="opacity-35 flex-initial w-5 text-right"
                    :size="12"
                    @click="deleteMutation({ id: program.id })"
                  />
                </div>
              </TableCell>
              <TableCell>{{ program.createdAt.toLocaleDateString() }}</TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger as-child>
                    <Button variant="outline" @click="idInEdit = program.id">
                      编辑
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>编辑节目内容</SheetTitle>
                    </SheetHeader>
                    <Card class="col-span-2">
                      <CardHeader class="flex flex-row items-center">
                        <div class="grid gap-2">
                          <CardTitle>节目：{{ program.name }}</CardTitle>
                        </div>
                        <Dialog>
                          <DialogTrigger as-child>
                            <Button variant="outline" class="ml-auto">
                              添加内容
                            </Button>
                          </DialogTrigger>
                          <DialogContent class="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>创建节目</DialogTitle>
                              <DialogDescription>
                                请输入节目名称
                              </DialogDescription>
                            </DialogHeader>
                            <div class="grid gap-4 py-4">
                              <div class="grid grid-cols-4 items-center gap-4">
                                <Label for="name" class="text-right">
                                  节目名称
                                </Label>
                                <Input id="name" v-model="name" class="col-span-3" />
                              </div>
                            </div>
                            <DialogClose>
                              <Button v-if="!isPending" type="submit" @click="createMutation({ name })">
                                创建节目
                              </Button>
                              <Button v-if="isPending" type="submit" disabled>
                                <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                                请稍候……
                              </Button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                内容id
                              </TableHead>
                              <TableHead class="w-64">
                                内容名称
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow v-for="content in sequence" :key="content.id">
                              <TableCell>{{ content.id }}</TableCell>
                              <TableCell>
                                <div v-if="content.type === 'pool'" class="flex">
                                  <p class="w-48 truncate">
                                    随机选取内容
                                  </p>
                                </div>
                                <div v-if="content.type === 'content'" />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <SheetFooter>
                      <SheetClose as-child>
                        <Button type="submit">
                          保存
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  Activity,
  CreditCard,
  DollarSign,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const idInEdit = ref(-1);
const { data: list, suspense } = useQuery({
  queryKey: ['program', 'list'],
  queryFn: () => $api.program.list.query(),
});
await suspense();
const { data: sequence } = useQuery({
  queryKey: ['program', 'getSequence', idInEdit],
  queryFn: () => {
    if (idInEdit.value === -1)
      return [];
    else $api.program.getSequence.query({ id: idInEdit.value });
  },
});

const name = ref('');
const edit_new_name = ref('');
const { mutate: createMutation, isPending } = useMutation({
  mutationFn: $api.program.create.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['program'] });
    toast.success('节目创建成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: deleteMutation } = useMutation({
  mutationFn: $api.program.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['program'] });
    toast.success('节目删除成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: editMutation } = useMutation({
  mutationFn: $api.program.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['program'] });
    toast.success('修改节目名成功');
  },
  onError: err => useErrorHandler(err),
});
</script>
