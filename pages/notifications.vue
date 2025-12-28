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
  <div class="text-grass11 text-sm leading-[18px] font-semibold">
    通知
  </div>
  <ScrollAreaRoot
    class="w-[1200px] h-[750px] relative overflow-hidden shadow-sm bg-white border rounded-lg"
    style="--scrollbar-size: 100px"
  >
    <div class="absolute top-0 z-10 w-full h-6 bg-gradient-to-t from-transparent to-white" />
    <ScrollAreaViewport class="w-full h-full rounded">
      <div class="py-[15px] px-5">
        <div
          v-for="noti in fetchList"
          :key="noti.id"
          class="text-mauve12 text-sm leading-[18px] mt-2.5 pt-2.5 border-t border-t-mauve6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{{ noti.title }}</CardTitle>
              <CardDescription> {{ noti.content }}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger>
                  <Button @click="updateTracedContentName(noti.content)">
                    查看
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{{ noti.title }}</DialogTitle>
                    <DialogDescription>追踪的内容 - "{{ tracedContentName }}"</DialogDescription>
                  </DialogHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          内容名称
                        </TableHead>
                        <TableHead>
                          标题
                        </TableHead>
                        <TableHead>
                          时间
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-for="traceNoti in traceList" :class="(traceNoti.id === noti.id)?'font-semibold':''">
                        <TableCell>
                          {{ tracedContentName.slice(0, 15) }}
                          <span v-if="tracedContentName.slice(15)">...</span>
                        </TableCell>
                        <TableCell>
                          {{ traceNoti.title }}
                        </TableCell>
                        <TableCell>
                          {{ traceNoti.createdAt.toLocaleDateString() }} {{ traceNoti.createdAt.toLocaleTimeString() }}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <!-- <div class="text-left">
                    通知日期：{{ noti.createdAt.toDateString().split(' ')[2] }} {{ noti.createdAt.toDateString().split(' ')[1] }}. {{ noti.createdAt.toDateString().split(' ')[3] }} ( {{ noti.createdAt.toDateString().split(' ')[0] }} )
                  </div>
                  <div class="text-center font-semibold h-8">
                    {{ noti.content }}
                  </div> -->
                  <div class="grid items-center justify-center">
                    <DialogClose as-child>
                      <Button v-if="!markIsPending" @click="markMutation({ notificationId: noti.id })" class="w-32">
                        确认已读
                      </Button>
                      <Button v-if="markIsPending">
                        <Loader2 v-if="markIsPending">
                          请稍候...
                        </Loader2>
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="flex select-none touch-none p-0.5 z-20 bg-blackA1 transition-colors duration-[160ms] ease-out hover:bg-blackA2 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
      />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      class="flex select-none touch-none p-0.5 bg-blackA6 transition-colors duration-[160ms] ease-out hover:bg-blackA8 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
      orientation="horizontal"
    >
      <ScrollAreaThumb
        class="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
      />
    </ScrollAreaScrollbar>

    <div class="absolute bottom-0 z-10 w-full h-6 bg-gradient-to-b from-transparent to-white" />
  </ScrollAreaRoot>
</template>

<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import guestBlocker from '~/middleware/blockers/guest-blocker';

definePageMeta({
  layout: false,
  middleware: [ guestBlocker, 'dynamic-layout' ],
});

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
/* if (userStore.role === 'admin') {
  setPageLayout('default');
} else if (userStore.role === 'club') {
  setPageLayout('club');
} */

function updateTracedContentName(content: string){
  // console.log(content);
  // console.log(content.split('\"')[1]);
  tracedContentName.value = content.split('\"')[1];
}

const tracedContentName = ref("");
const traceList = computed(() => {
  const computedNotiList: ({
    id: number;
    title: string;
    content: string;
    createdAt: Date;
  })[] = [];
  allList.value?.forEach((Noti) => {
    if(Noti.content.split('\"')[1] === tracedContentName.value)
      computedNotiList.push(Noti);
  })
  return computedNotiList;
})

</script>
