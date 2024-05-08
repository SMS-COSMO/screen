<template>
  <div>
    <ClientOnly>
      <Toaster position="top-center" rich-colors />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import '~/styles/index.css';
</script>
