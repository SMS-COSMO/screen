<template>
  <div class="justify-center grid">
    <div class="items-center w-36 h-10 grid shadow rounded-xl border">
      <p v-if="info !== undefined && info.status" class="text-center table-cell" style="font:message-box">
        <!-- message-box 字体在 Tailwind 里找不到对应 -->
        {{ info.weather }} / {{ info.temperature }}°C / {{ info.humidity }}%
      </p>
      <p v-if="info === undefined || !info.status" class="text-center table-cell text-red-500" style="font:message-box">
        <!-- html 的 color:red 是 0xFF0000, Tailwind 里最接近的是 text-red-500 (0xEF4444) -->
        网络错误
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { $api } = useNuxtApp();
// const userStore = useUserStore();
// const queryClient = useQueryClient();

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
