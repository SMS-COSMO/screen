<template>
  <Button variant="ghost" @click="copyText(props.text, props.delay)">
    <Copy v-if="!isSuccess" />
    <Check v-else />
  </Button>
</template>

<script setup lang="ts">
import { useClipboard } from '#imports';
import { Check, Copy } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const isSuccess = ref(false);

const props = defineProps<{
  text: string;
  delay?: number;
}>()

async function copyText(text: string, delay: number = 4) {
  await useClipboard().copy(text).then(() => {
    isSuccess.value = true;
    toast.success('复制成功');
    setTimeout(() => {
      isSuccess.value = false;
    }, delay * 1000);
  }).catch((err) => toast.error(err));
}
</script>