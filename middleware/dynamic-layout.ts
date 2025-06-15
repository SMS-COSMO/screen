export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if (userStore.role == 'admin')
    setPageLayout('default');
  else if (userStore.role == 'club')
    setPageLayout('club');
})
