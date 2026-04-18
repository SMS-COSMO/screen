<template>
  <Card class="border-0 shadow-none">
    <div>
    <CardContent class="--flex items-center justify-center py-4 --bg-green-500">
        <span class="text-2xl text-center">
          {{ date.split(' ')[0] }}
        </span>
        <span class="ml-2 text-2xl text-center">
          {{ date.split(' ')[1] }}
        </span>
        <span class="ml-2 text-2xl font-bold tracking-widest">
          {{ time }}
        </span>
      </CardContent>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const weeks = ['日', '一', '二', '三', '四', '五', '六'];
const now = new Date();
const date = ref(`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weeks[now.getDay()]}`);
const time = ref(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
onMounted(() => {
  setInterval(() => {
    const now = new Date();
    date.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weeks[now.getDay()]}`;
    time.value = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }, 30000);
});
</script>
