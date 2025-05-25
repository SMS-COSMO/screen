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
          <TableHeader>
            通知
          </TableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="notificantion in fetchList" :key="notificantion.id">
          <TableCell>
            <Card>
              <CardHeader>
                <CardTitle>{{ notificantion.title }}</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger>
                    <Button>查看</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>标题：{{ notificantion.title }}</DialogTitle>
                    </DialogHeader>
                    <div>
                      {{ notificantion.cotent }}
                    </div>
                    <DialogClose>
                      <Button>确认已读</Button>
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

const { $api } = useNuxtApp();

const filter = ref('all'); // all:全部消息 unread:未读消息
// type notification = { id: number; createAt: Date; title: string; cotent: string; unread: boolean }

// 测试用
const fetchList = computed(() => {
  return {
    all: [{ id: 1, createAt: 2, title: '33', cotent: '44', unread: true }, { id: 2, createAt: 2, title: '3222', cotent: '424', unread: false }],
    unread: [{ id: 1, createAt: 2, title: '33', cotent: '44', unread: true }],
  }[filter.value];
});
</script>
