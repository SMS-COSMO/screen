<template>
  <Title>设备管理</Title>
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
          <CardTitle>所有设备</CardTitle>
        </div>
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline" class="ml-auto">
              创建设备
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>请输入设备名称</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="location" class="text-right">
                  设备名称
                </Label>
                <Input id="location" v-model="location" class="col-span-3" />
              </div>
            </div>
            <DialogClose>
              <Button v-if="!isPending" type="submit" @click="createMutation({ location })">
                创建设备
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
                设备id
              </TableHead>
              <TableHead class="w-64">
                设备名称
              </TableHead>
              <TableHead>
                创建时间
              </TableHead>
              <TableHead>
                节目名称
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="device in list" :key="device.id">
              <TableCell>
                {{ device.id }}
              </TableCell>
              <TableCell>
                <div class="flex">
                  <p class="w-48 truncate">
                    {{ device.location }}
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
                        <DialogTitle>请输入新的设备名</DialogTitle>
                      </DialogHeader>
                      <div class="grid gap-4 py-4">
                        <div class="grid grid-cols-4 items-center gap-4">
                          <Label for="location" class="text-right">
                            设备名称
                          </Label>
                          <Input id="location" v-model="edit_new_location" class="col-span-3" />
                        </div>
                      </div>
                      <DialogClose>
                        <Button
                          v-if="!isPending2"
                          type="submit"
                          @click="editMutation({ id: device.id, new_location: edit_new_location })"
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
                  <Trash2
                    class="opacity-35 flex-initial w-5 text-right"
                    :size="12"
                    @click="deleteMutation({ id: device.id })"
                  />
                </div>
              </TableCell>
              <TableCell>{{ device.createdAt.toLocaleDateString() }}</TableCell>
              <TableCell>
                <div class="flex items-center">
                  <Label>{{ getProgramName(device.id) || '未绑定节目' }}</Label>
                  <Dialog>
                    <DialogTrigger as-child @click="handlePopoverOpen(device.id)">
                      <Pencil
                        class="opacity-35 flex-initial w-5 text-right"
                        :size="12"
                      />
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          绑定节目
                        </DialogTitle>
                      </DialogHeader>
                      <div class="grid gap-4 py-4">
                        <div class="grid gap-2">
                          <Label for="category">节目名称</Label>
                          <Popover v-model:open="unfoldCheckbox[device.id]">
                            <PopoverTrigger as-child>
                              <Button
                                variant="outline"
                                role="combobox"
                                class="flex w-full justify-between"
                              >
                                <p>
                                  {{ getProgramNameById(deviceSelectedProgramId[device.id]) || '未绑定节目' }}
                                </p>
                                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-[200px] p-2">
                              <Command class="w-full">
                                <CommandEmpty>请选择节目</CommandEmpty>
                                <CommandList>
                                  <CommandGroup>
                                    <CommandItem
                                      v-for="program in list2"
                                      :key="program.id"
                                      :value="program.id"
                                      @select="(ev: any) => {
                                        const value = ev.detail.value;
                                        if (typeof value === 'number') {
                                          deviceSelectedProgramId[device.id] = value;
                                        }
                                        unfoldCheckbox[device.id] = false;
                                      }"
                                    >
                                      {{ program.name }}
                                      <Check
                                        v-if="program.id === deviceSelectedProgramId[device.id]"
                                        class="ml-auto h-4 w-4"
                                      />
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <DialogClose>
                        <Button type="submit" @click="confirmBindProgram(device.id)">
                          确认绑定
                        </Button>
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
</template>

<script setup lang="ts">
import {
  Activity,
  Check,
  ChevronsUpDown,
  CreditCard,
  DollarSign,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { reactive, ref } from 'vue';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

onMounted(() => {
  if (useUserStore().role === 'club') {
    useRouter().push('/'); // 跳转到首页
  }
});
const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const { data: list, suspense: deviceSuspense } = useQuery({
  queryKey: ['device', 'list'],
  queryFn: () => $api.device.list.query(),
});
await deviceSuspense();

// 获取节目列表
const { data: list2, suspense: programSuspense } = useQuery({
  queryKey: ['program', 'list'],
  queryFn: () => $api.program.list.query(),
});
await programSuspense();

const location = ref('');
const edit_new_location = ref('');

// 用于保存每个设备的 selectedProgramId
const deviceSelectedProgramId = reactive<{ [key: number]: number }>({});

// 用于保存每个设备的 unfoldCheckbox 状态
const unfoldCheckbox = reactive<{ [key: number]: boolean }>({});

// 初始化每个设备的 selectedProgramId 和 unfoldCheckbox 状态
list.value?.forEach((device) => {
  deviceSelectedProgramId[device.id] = device.programId ?? -1; // -1 表示未选择任何节目
  unfoldCheckbox[device.id] = false;
});

const { mutate: createMutation, isPending } = useMutation({
  mutationFn: $api.device.create.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device', 'list'] });
    toast.success('设备创建成功');
  },
  onError: err => useErrorHandler(err),
});

const { mutate: deleteMutation } = useMutation({
  mutationFn: $api.device.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device', 'list'] });
    toast.success('设备删除成功');
  },
  onError: err => useErrorHandler(err),
});

const { mutate: editMutation, isPending: isPending2 } = useMutation({
  mutationFn: $api.device.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device', 'list'] });
    toast.success('修改设备名成功');
  },
  onError: err => useErrorHandler(err),
});

// 绑定节目到设备的 mutation
const { mutate: bindProgramMutation } = useMutation({
  mutationFn: $api.device.bindProgram.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device', 'list'] });
    toast.success('节目绑定成功');
  },
  onError: err => useErrorHandler(err),
});

// 根据设备ID获取节目名称
function getProgramName(deviceId: number): string | undefined {
  const device = list.value?.find(d => d.id === deviceId);
  if (!device || !device.programId)
    return undefined;
  return list2.value?.find(program => program.id === device.programId)?.name;
}

// 确认绑定节目
function confirmBindProgram(deviceId: number) {
  const programId = deviceSelectedProgramId[deviceId];
  bindProgramMutation({ id: deviceId, programId });
}

// 根据节目ID获取节目名称
function getProgramNameById(programId: number): string | undefined {
  return list2.value?.find(program => program.id === programId)?.name;
}

// Poverty打开后优先将显示的选定节目更新为当前设备的节目ID
function handlePopoverOpen(deviceId: number) {
  const device = list.value?.find(d => d.id === deviceId);
  if (device && device.programId !== undefined)
    deviceSelectedProgramId[deviceId] = device.programId ?? -1;
}
</script>
