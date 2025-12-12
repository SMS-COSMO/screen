import { toast } from "vue-sonner";

// 在以下路由使用: '/', /device', '/program', '/invitation', '/notifications', '/user', '/content/create', '/content/admin', '/content/club', '/content/recreate'
// 阻止未登录用户访问此页面，并重定向至登录页面
// 此中间件只是为了提升用户体验，不能替代后端的用户权限检验

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if(!userStore.loggedIn){
    toast.error('用户未登录');
    return navigateTo(`/login?redirect=${to.fullPath}`);
  }
  else return true;
})