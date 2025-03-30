<template>
  <Card class="border-0 shadow-none bg-transparent">
    <CardContent class="flex flex-col items-center justify-center py-2">
      <div v-if="info !== undefined && info.status" class="text-2xl text-center flex items-center justify-center">
        {{ info.weather }} / {{ info.temperature }}°C / {{ info.humidity }}%
        <Icon :name="getIconName(info.weather)" class="h-6 w-6 ml-2" />
      </div>
      <div v-if="info === undefined || !info.status" class="text-2xl text-center table-cell text-red-500">
        网络错误
        <Icon name="lucide:circle-x" class="h-6 w-6 ml-2 inline" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
// const userStore = useUserStore();
// const queryClient = useQueryClient();

function getIconName(key: string | undefined) {
  const now = (new Date()).getHours();
  if (key === '晴') {
    if (now >= 6 && now <= 19)
      return 'lucide:sun';
    else
      return 'lucide:moon-star';
  }
  if (key === '晴间多云') {
    if (now >= 6 && now <= 19)
      return 'lucide:cloud-sun';
    else
      return 'lucide:cloud-moon';
  }
  if (key === '少云')
    return 'lucide:cloud';
  if (key === '多云' || key === '阴')
    return 'lucide:cloudy';
  if (key === '阵雨' || key === '细雨' || key === '小雨' || key === '中雨' || key === '大雨' || key === '暴雨' || key === '大暴雨')
    return 'lucide:cloud-drizzle';
  if (key === '雷阵雨')
    return 'lucide:cloud-lightning';
  if (key === '有风' || key === '微风' || key === '和风' || key === '清风')
    return 'lucide:wind';
  if (key === '雾' || key === '浓雾' || key === '强浓雾')
    return 'lucide:haze';
  if (key === '雪' || key === '阵雪' || key === '小雪' || key === '中雪')
    return 'lucide:snowflake';
  return 'lucide:circle-x';
}

const { data: info, suspense } = useQuery({
  queryKey: ['weather', 'info'],
  queryFn: () => $api.weather.info.query(),
  refetchInterval: 600000,
});
await suspense();

// 用的是高德地图的 api
/*
  高德地图返回值的格式：
  {
    status:0/1
    ...
    lives:[
      {
        ...
        weather (汉字描述)
        temperature
        ...
        humidity
        reporttime
      }
    ]
  }
  他们的官方文档在 https://lbs.amap.com/api/webservice/guide/api/weatherinfo/
*/
</script>
