<template>
  <div class="w-full lg:grid h-full">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">
              登录
            </CardTitle>
            <CardDescription>
              欢迎来到显示屏管理系统
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
