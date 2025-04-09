<template>
  <Card class="border-0 shadow-none">
    <div>
      <CardContent class="flex flex-col items-center justify-center py-4">
        <div class="text-6xl font-bold text-center tracking-widest">
          {{ time }}
        </div>
        <div class="text-2xl mt-2 text-center">
          {{ date }}
        </div>
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
