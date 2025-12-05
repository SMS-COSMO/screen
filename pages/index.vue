<template>
  <Title>食堂显示屏管理系统</Title>
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          未读消息数
        </CardTitle>
        <BellRing class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div v-if="countUnread !== -1" class="text-2xl font-bold">
          {{ countUnread }}
        </div>
        <div v-else class="text-2xl font-bold text-red-500">
          获取失败
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          消息总数
        </CardTitle>
        <Bell class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div v-if="countAll !== -1" class="text-2xl font-bold">
          {{ countAll }}
        </div>
        <div v-else class="text-2xl font-bold text-red-500">
          获取失败
        </div>
      </CardContent>
    </Card>
  </div>
  <div class="grid md:grid-cols-1 gap-4 md:gap-8 lg:grid-cols-1">
    <Card v-for="message in unreadList?.slice(0, 5)" :key="message.id" class="justify-center items-center grid-cols-2">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          {{ message.createdAt.toLocaleString() }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a class="text-sm font-medium text-gray-500 hover:underline hover:text-gray-800 dark:hover:text-white" href="\notifications">
          {{ message.content }}
        </a>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Bell, BellRing } from 'lucide-vue-next';

const { $api } = useNuxtApp();

const userStore = useUserStore();
// if (userStore.role === 'admin') {
//   setPageLayout('default');
// } else if (userStore.role === 'club') {
//   setPageLayout('club');
// }
definePageMeta({
  layout: false,
  middleware: 'dynamic-layout',
});

const { data: allList, suspense: allSuspense } = useQuery({
  queryKey: ['notification', 'all'],
  queryFn: () => $api.notification.getAllByOwner.query(),
});
await allSuspense();
const countAll = allList.value === undefined ? -1 : allList.value.length;

const { data: unreadList, suspense: unreadSuspense } = useQuery({
  queryKey: ['notification', 'unread'],
  queryFn: () => $api.notification.getUnreadByOwner.query(),
});
await unreadSuspense();
const countUnread = unreadList.value === undefined ? -1 : unreadList.value.length;
</script>
