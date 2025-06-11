<template>
  <Title>内容展示导航界面</Title>
  <div>
    您在路由中 没有输入 或 错误输入 了设备ID，导致无法正常调用显示内容。<br>
    请查看下面列出的可用设备列表，找出您的正确设备，并从导航按钮前往正确页面。
  </div>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-64">
          设备名称
        </TableHead>
        <TableHead>
          创建时间
        </TableHead>
        <TableHead>
          导航按钮
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="device in list" :key="device.id">
        <TableCell>
          <div class="flex">
            <p class="w-48 truncate">
              {{ device.location }}
            </p>
          </div>
        </TableCell>
        <TableCell>
          {{ device.createdAt.toLocaleDateString() }}
        </TableCell>
        <TableCell>
          <Button variant="outline" @click="Navigate(device.id)">
            前往
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();

const { data: list, suspense } = useQuery({
  queryKey: ['device', 'list'],
  queryFn: () => $api.device.list.query(),
});
await suspense();

function Navigate(id: number) {
  navigateTo(`/showcase/${id}`);
}
</script>
