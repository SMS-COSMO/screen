<template>
  <Card>
    <CardHeader>
      <CardTitle>当前时间</CardTitle>
    </CardHeader>
    <div>
      <CardContent>
        {{ date }}
      </CardContent>
    </div>
    <div>
      <CardContent>
        {{ time }}
      </CardContent>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { onDeactivated, onMounted, ref } from 'vue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const weeks = ['日', '一', '二', '三', '四', '五', '六'];
const now = new Date();
const date = ref(`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDay()}日 星期${weeks[now.getDay()]}`);
const time = ref(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
onMounted(() => {
  setInterval(() => {
    const now = new Date();
    date.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDay()}日 星期${weeks[now.getDay()]}`;
    time.value = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }, 30000);
});
</script>
