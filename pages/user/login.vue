<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-screen">
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-2 text-center">
          <h1 class="text-3xl font-bold">
            登录
          </h1>
          <p class="text-balance text-muted-foreground">
            欢迎来到显示屏管理系统
          </p>
        </div>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">用户名</Label>
            <Input
              id="username"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">密码</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" class="w-full">
            登录
          </Button>
        </div>
      </div>
    </div>
    <div class="hidden bg-muted lg:block" />
  </div>
</template>
