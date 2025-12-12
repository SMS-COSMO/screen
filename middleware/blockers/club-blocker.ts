import { toast } from "vue-sonner";

// 在以下路由使用: '/device', '/program', '/invitation'
// 阻止 club 访问此页面，并重定向至首页
// 此中间件只是为了提升用户体验，不能替代后端的用户权限检验

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if(userStore.loggedIn && userStore.role == 'club'){
    toast.error('用户没有权限访问此页面');
    return navigateTo(`/`);
  }
  else return true;
})