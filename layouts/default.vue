<template>
  <DefineTemplate v-slot="{ path, icon, name }">
    <NuxtLink
      :href="path"
      :class="`${$route.path === path ? 'bg-muted text-foreground' : 'text-muted-foreground'} flex items-center gap-3
              rounded-lg px-3 py-2 my-1 transition-all hover:text-foreground`"
    >
      <Icon :name="icon" size="16" />
      {{ name }}
    </NuxtLink>
  </DefineTemplate>

  <div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
    <div class="hidden border-r bg-muted/40 md:block">
      <div class="flex h-full max-h-screen flex-col gap-2">
        <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" class="flex items-center gap-2 font-semibold">
            <Icon name="lucide:monitor" size="24" />
            <span class="">食堂显示屏</span>
          </a>
          <Button variant="outline" size="icon" class="ml-auto h-8 w-8">
            <Bell class="h-4 w-4" />
            <span class="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div class="flex-1">
          <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
            <ReuseTemplate icon="lucide:home" name="主页" path="/" />
            <ReuseTemplate icon="lucide:monitor" name="设备管理" path="/device" />
            <ReuseTemplate icon="lucide:list-video" name="节目管理" path="/program" />
            <ReuseTemplate icon="lucide:package" name="内容管理" path="/content" />
            <ReuseTemplate icon="lucide:upload" name="上传内容" path="/content/create" />
          </nav>
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <header class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <Sheet>
          <SheetTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="shrink-0 md:hidden"
            >
              <Menu class="h-5 w-5" />
              <span class="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="flex flex-col">
            <nav class="grid gap-2 text-lg font-medium">
              <a
                href="#"
                class="flex items-center gap-2 text-lg font-semibold mb-3"
              >
                <Icon name="lucide:monitor" size="24" />
                <span class="sr-only">食堂显示屏</span>
              </a>
              <ReuseTemplate icon="lucide:home" name="主页" path="/" />
              <ReuseTemplate icon="lucide:monitor" name="设备管理" path="/device" />
              <ReuseTemplate icon="lucide:list-video" name="节目管理" path="/program" />
              <ReuseTemplate icon="lucide:package" name="内容管理" path="/content" />
              <ReuseTemplate icon="lucide:upload" name="上传内容" path="/content/create" />
            </nav>
          </SheetContent>
        </Sheet>
        <div class="w-full flex-1" />
        <DarkToggle />
        <ClientOnly>
          <DropdownMenu v-if="store.loggedIn">
            <DropdownMenuTrigger as-child>
              <Button variant="secondary" size="icon" class="rounded-full">
                <CircleUser class="h-5 w-5" />
                <span class="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel v-if="store.loggedIn">
                {{ store.username }}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>设置</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="logout">
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button v-else variant="outline" @click="navigateTo('/login')">
            请登录
          </Button>
        </ClientOnly>
      </header>
      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core';
import { Bell, CircleUser, Menu } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const store = useUserStore();
const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

function logout() {
  store.logout();
  navigateTo('/');
  toast.success('登出成功');
}
</script>
