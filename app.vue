<template>
  <div>
    <ClientOnly>
      <Toaster position="top-center" />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import '~/styles/index.css';
</script>
