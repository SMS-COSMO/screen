<template>
  <Title>通知</Title>
  <Select v-model="filter">
    <SelectTrigger class="w-[200px]">
      <SelectValue placeholder="全部消息" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="all">
          全部消息
        </SelectItem>
        <SelectItem value="unread">
          未读消息
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            通知
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="notification in fetchList" :key="notification.id">
          <TableCell>
            <Card>
              <CardHeader>
                <CardTitle>{{ notification.title }}</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger>
                    <Button>
                      查看
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>标题：{{ notification.title }}</DialogTitle>
                    </DialogHeader>
                    <div>
                      通知日期:{{ notification.createdAt.toDateString() }}
                    </div>
                    {{ notification.content }}
                    <DialogClose>
                      <Button v-if="!markIsPending" @click="markMutation({ notificationId: notification.id })">
                        确认已读
                      </Button>
                      <Button v-if="markIsPending">
                        <Loader2 v-if="markIsPending">
                          请稍候...
                        </Loader2>
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue-sonner';

const { $api } = useNuxtApp();
const filter = ref('all');
const queryCilent = useQueryClient();
const userStore = useUserStore();
const { mutate: markMutation, isPending: markIsPending } = useMutation({
  mutationFn: $api.notification.markRead.mutate,
  onSuccess: () => {
    queryCilent.invalidateQueries({ queryKey: ['notification'] });
    toast.success('已标记为已读');
  },
  onError: err => useErrorHandler(err),
}); // 单个查询操作

const { mutate: createMutaion, isPending: createIsPending } = useMutation({
  mutationFn: $api.notification.createNotification.mutate,
  onSuccess: () => {
    toast.success('创建成功');
  },
  onError: err => useErrorHandler(err),
}); // 创建通知

const { data: allList, suspense: allSuspense } = useQuery({
  queryKey: ['notification', 'all'],
  queryFn: () => $api.notification.getAllByOwner.query(),
});
await allSuspense(); // 获取所有的通知

const { data: unreadList, suspense: unreadSuspense } = useQuery({
  queryKey: ['notification', 'unread'],
  queryFn: () => $api.notification.getUnreadByOwner.query(),
});
await unreadSuspense(); // 获取未读通知

const fetchList = computed(() => {
  return {
    all: allList.value || [],
    unread: unreadList.value || [],
  }[filter.value];
});
if (userStore.role === 'admin') {
  setPageLayout('default');
} else if (userStore.role === 'club') {
  setPageLayout('club');
}
definePageMeta({
  layout: false,
});
</script>
