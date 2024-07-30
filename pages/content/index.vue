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
                节目id
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
                {{ device.programId }}
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const { data: list, suspense } = useQuery({
  queryKey: ['device.list'],
  queryFn: () => $api.device.list.query(),
});
await suspense();

const location = ref('');
const edit_new_location = ref('');
const { mutate: createMutation, isPending } = useMutation({
  mutationFn: $api.device.create.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device.list'] });
    toast.success('设备创建成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: deleteMutation } = useMutation({
  mutationFn: $api.device.delete.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device.list'] });
    toast.success('设备删除成功');
  },
  onError: err => useErrorHandler(err),
});
const { mutate: editMutation, isPending: isPending2 } = useMutation({
  mutationFn: $api.device.edit.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device.list'] });
    toast.success('修改设备名成功');
  },
  onError: err => useErrorHandler(err),
});
</script>
