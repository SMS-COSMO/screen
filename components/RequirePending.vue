<template>
  <slots />
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

const { isPending } = defineProps({ isPending: Boolean });
const slots = useSlots();
</script>
