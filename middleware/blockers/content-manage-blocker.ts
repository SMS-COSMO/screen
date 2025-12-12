import { toast } from "vue-sonner";

// 在以下路由使用: '/content/club', '/content/admin'
// 如果用户权限 和正在访问的页面 不匹配，重定向至正确的页面
// 此中间件只是为了提升用户体验，不能替代后端的用户权限检验

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if(to.path === '/content/admin' && userStore.role === 'club')
    return navigateTo('/content/club');
  else if(to.path === '/content/club' && userStore.role === 'admin')
    return navigateTo('/content/admin');
  else return true;
})