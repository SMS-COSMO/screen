<template>
  <Title>内容展示</Title>
  <div class="grid gap-4 md:gap-8">
    <Card class="col-span-4">
      <CardContent>
        <!-- 这里可以添加具体的展示内容 -->
        <div class="min-h-[500px] flex items-center justify-center text-muted-foreground">
          展示区域
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// 设置使用 showcase 布局
definePageMeta({
  layout: 'showcase',
  name: 'showcase',
});
</script>
