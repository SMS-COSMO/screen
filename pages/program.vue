<template>
  <Title>节目管理</Title>
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          节目总数
        </CardTitle>
        <AppWindow class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ programList ? programList.length : 0 }}
        </div>
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
            <TableRow v-for="program in programList" :key="program.id">
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
                        @click="edit_new_name = program.name"
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
                  <!-- 刚刚不小心误删了一个节目，特此添加确认弹窗 -->
                  <Dialog>
                    <DialogTrigger as-child>
                    <Trash2
                      class="opacity-35 flex-initial w-5 text-right"
                      :size="12"
                    />
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>删除节目</DialogTitle>
                        <DialogDescription>
                          此操作是不可逆的，请再次确认
                        </DialogDescription>
                      </DialogHeader>
                      <div class="grid text-center items-center h-12">
                        <Label class="font-bold">
                          节目 "{{ program.name }}" 将被永久删除
                        </Label>
                      </div>
                      <DialogClose>
                        <Button
                          v-if="!isPending"
                          type="submit"
                          @click="deleteMutation({ id: program.id })"
                        >
                          确认删除
                        </Button>
                        <Button v-if="isPending" type="submit" disabled>
                          <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                          请稍候……
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
              <TableCell>{{ program.createdAt.toLocaleDateString() }}</TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger as-child>
                    <Button
                      variant="outline"
                      @click="() => {
                        idInEdit = program.id;
                        queryClient.invalidateQueries({ queryKey: ['program'] });
                      }"
                    >
                      编辑
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle class="p-5">
                        编辑节目内容
                      </SheetTitle>
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
                              <DialogTitle>
                                选择内容
                              </DialogTitle>
                            </DialogHeader>
                            <div class="grid gap-4 py-4">
                              <div class="flex gap-1.5">
                                <Checkbox v-model="chooseRandomContent" />
                                <Label class="text-left">
                                  使用随机内容
                                </Label>
                              </div>
                              <div class="grid gap-2">
                                <Label for="category">内容所属类别</Label>
                                <Popover v-model:open="unfoldCheckbox">
                                  <PopoverTrigger as-child>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      :aria-expanded="unfoldCheckbox"
                                      class="flex w-full justify-between"
                                    >
                                      <p>
                                        {{
                                          checkedCategory.id !== -1
                                            ? checkedCategory.category
                                            : '选择类别'
                                        }}
                                      </p>
                                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent class="w-[200px] p-2">
                                    <Command>
                                      <CommandEmpty>请选择类别</CommandEmpty>
                                      <CommandList>
                                        <CommandGroup>
                                          <CommandItem
                                            v-for="pool in categoryList"
                                            :key="pool.id"
                                            :value="pool.id"
                                            @select="(ev: any) => {
                                              if (typeof ev.detail.value === 'number') {
                                                checkedCategory.id = ev.detail.value;
                                                checkedCategory.category = pool.category;
                                                queryClient.invalidateQueries({ queryKey: ['content'] });
                                              }
                                              unfoldCheckbox = false;
                                            }"
                                          >
                                            {{ pool.category }}
                                            <Check
                                              v-if="checkedCategory.id === pool.id"
                                              class="ml-auto h-4 w-4"
                                            />
                                          </CommandItem>
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div
                                v-if="checkedCategory.id !== -1 && !chooseRandomContent"
                                class="grid gap-2"
                              >
                                <Command class="rounded-lg border shadow-md max-w-[450px]">
                                  <CommandInput placeholder="搜索内容……" />
                                  <CommandEmpty>没有找到相关内容。</CommandEmpty>
                                  <CommandList>
                                    <CommandGroup>
                                      <CommandItem
                                        v-for="content in selectedContentList"
                                        :key="content.id"
                                        :value="content.name"
                                        @click="selectedContentId = content.id"
                                      >
                                        <span>{{ content.name }}</span>
                                        <Check
                                          v-if="selectedContentId === content.id"
                                          class="ml-auto h-4 w-4"
                                        />
                                      </CommandItem>
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </div>
                            </div>
                            <DialogClose>
                              <Button v-if="!seqEditPending" type="submit" @click="appendContent">
                                添加内容
                              </Button>
                              <Button v-if="seqEditPending" type="submit" disabled>
                                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
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
                              <TableHead class="w-16">
                                随机选取内容/单个内容
                              </TableHead>
                              <TableHead class="text-left">
                                内容类型/内容名称
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow v-for="(content, index) in sequence" :key="content.id">
                              <TableCell>
                                <div v-if="content.type === 'pool'" class="flex">
                                  <p class="w-48 truncate">
                                    随机选取内容
                                  </p>
                                </div>
                                <div v-if="content.type === 'content'" class="flex">
                                  <p class="w-48 truncate">
                                    单个内容
                                  </p>
                                </div>
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
                                        <DialogTitle>
                                          修改内容
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div class="grid gap-4 py-4">
                                        <div class="flex gap-1.5">
                                          <Checkbox v-model:checked="chooseRandomContent" />
                                          <Label class="text-left">
                                            使用随机内容
                                          </Label>
                                        </div>
                                        <div class="grid gap-2">
                                          <Label for="category">内容所属类别</Label>
                                          <Popover v-model:open="unfoldCheckbox">
                                            <PopoverTrigger as-child>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                :aria-expanded="unfoldCheckbox"
                                                class="flex w-full justify-between"
                                              >
                                                <p>
                                                  {{
                                                    checkedCategory.id !== -1
                                                      ? checkedCategory.category
                                                      : '选择类别'
                                                  }}
                                                </p>
                                                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent class="w-[200px] p-2">
                                              <Command>
                                                <CommandEmpty>请选择类别</CommandEmpty>
                                                <CommandList>
                                                  <CommandGroup>
                                                    <CommandItem
                                                      v-for="pool in categoryList"
                                                      :key="pool.id"
                                                      :value="pool.id"
                                                      @select="(ev: any) => {
                                                        if (typeof ev.detail.value === 'number') {
                                                          checkedCategory.id = ev.detail.value;
                                                          checkedCategory.category = pool.category;
                                                          queryClient.invalidateQueries({ queryKey: ['content'] });
                                                        }
                                                        unfoldCheckbox = false;
                                                      }"
                                                    >
                                                      {{ pool.category }}
                                                      <Check
                                                        v-if="checkedCategory.id === pool.id"
                                                        class="ml-auto h-4 w-4"
                                                      />
                                                    </CommandItem>
                                                  </CommandGroup>
                                                </CommandList>
                                              </Command>
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                        <div
                                          v-if="checkedCategory.id !== -1 && !chooseRandomContent"
                                          class="grid gap-2"
                                        >
                                          <Command class="rounded-lg border shadow-md max-w-[450px]">
                                            <CommandInput placeholder="搜索内容……" />
                                            <CommandEmpty>没有找到相关内容。</CommandEmpty>
                                            <CommandList>
                                              <CommandGroup>
                                                <CommandItem
                                                  v-for="content_ in selectedContentList"
                                                  :key="content_.id"
                                                  :value="content_.name"
                                                  @click="selectedContentId = content_.id"
                                                >
                                                  <span>{{ content_.name }}</span>
                                                  <Check
                                                    v-if="selectedContentId === content_.id"
                                                    class="ml-auto h-4 w-4"
                                                  />
                                                </CommandItem>
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </div>
                                      </div>
                                      <DialogClose>
                                        <Button v-if="!seqEditPending" type="submit" @click="replaceContent(index)">
                                          修改内容
                                        </Button>
                                        <Button v-if="seqEditPending" type="submit" disabled>
                                          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                                          请稍候……
                                        </Button>
                                      </DialogClose>
                                    </DialogContent>
                                  </Dialog>
                                  <Trash2
                                    class="opacity-35 flex-initial w-5 text-right"
                                    :size="12"
                                    @click="deleteContent(index)"
                                  />
                                </div>
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
  AppWindow,
  Check,
  ChevronsUpDown,
  CreditCard,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TableCell from '~/components/ui/table/TableCell.vue';
import guestBlocker from '~/middleware/blockers/guest-blocker';
import clubBlocker from '~/middleware/blockers/club-blocker';

definePageMeta({
  layout: 'default',
  middleware: [ guestBlocker, clubBlocker ],
});

const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const idInEdit = ref(-1);
const { data: programList, suspense } = useQuery({
  queryKey: ['program', 'list'],
  queryFn: () => $api.program.list.query(),
});
await suspense();
const { data: sequence } = useQuery({
  queryKey: ['program', 'getSequence', idInEdit],
  queryFn: () => {
    if (idInEdit.value === -1)
      return [];
    else return $api.program.getSequence.query({ id: idInEdit.value });
  },
});

const chooseRandomContent = ref<boolean | 'indeterminate'>(false);
const unfoldCheckbox = ref(false);
const checkedCategory = reactive({ id: -1, category: '' });
const { data: categoryList } = useQuery({
  queryKey: ['pool', 'list'],
  queryFn: () => $api.pool.list.query(),
});

const selectedContentId = ref(-1);
const { data: selectedContentList } = useQuery({
  queryKey: ['content', 'listByCategory'],
  queryFn: () => {
    if (checkedCategory.id !== -1)
      return $api.content.listByCategory.query({ id: checkedCategory.id });
    else
      return [];
  },
});

const {
  mutate: sequenceMutation,
  isPending: seqEditPending,
  isSuccess: seqEditSuccess,
} = useMutation({
  mutationFn: $api.program.setSequence.mutate,
  onError: err => useErrorHandler(err),
});
onMounted(() => {
  if (useUserStore().role === 'club') {
    useRouter().push('/'); // 跳转到首页
  }
});
function appendContent() {
  if (sequence.value === undefined)
    return;
  sequenceMutation({
    id: idInEdit.value,
    sequence: sequence.value.concat([{
      type: chooseRandomContent.value ? 'pool' : 'content',
      id: chooseRandomContent.value ? checkedCategory.id : selectedContentId.value,
    }]),
  });
  if (seqEditSuccess)
    toast.success('添加内容成功');
  queryClient.invalidateQueries({ queryKey: ['program'] });
}
function deleteContent(index: number) {
  if (sequence.value === undefined)
    return;
  sequenceMutation({
    id: idInEdit.value,
    sequence: sequence.value.toSpliced(index, 1),
  });
  if (seqEditSuccess)
    toast.success('删除内容成功');
  queryClient.invalidateQueries({ queryKey: ['program'] });
}
function replaceContent(index: number) {
  if (sequence.value === undefined)
    return;
  sequenceMutation({
    id: idInEdit.value,
    sequence: sequence.value.toSpliced(
      index,
      1,
      {
        type: chooseRandomContent.value ? 'pool' : 'content',
        id: chooseRandomContent.value ? checkedCategory.id : selectedContentId.value,
      },
    ),
  });
  if (seqEditSuccess)
    toast.success('修改内容成功');
  queryClient.invalidateQueries({ queryKey: ['program'] });
}

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
