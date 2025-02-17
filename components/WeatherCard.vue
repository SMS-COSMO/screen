<template>
  <div style="justify-content:center;" class="grid">
    <div style="align-items:center;width:150px;height:40px;" class="grid shadow rounded-xl border">
      <p v-if="info.status" style="text-align:center;font:message-box;display:table-cell;">
        {{ info.weather }} / {{ info.temperature }}°C / {{ info.humidity }}%
      </p>
      <p v-if="!info.status" style="text-align:center;font:message-box;display:table-cell;color:red">
        网络错误
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { toast } from 'vue-sonner';

const info = reactive({
  status: -1,
  weather: '未知',
  temperature: 0,
  humidity: 0, // 湿度
  reporttime: '',
});

function getWeather() {
  axios.get('https://restapi.amap.com/v3/weather/weatherInfo?key=28589df0732b94de2d2d9f10c29ec146&city=440300&extensions=base&output=JSON').then((response) => {
    const data = response.data;
    info.status = data.status;
    info.weather = data.lives[0].weather;
    info.temperature = data.lives[0].temperature;
    info.humidity = data.lives[0].humidity;
    info.reporttime = data.lives[0].reporttime;
    if (info.status)
      toast.success(`successfully updated weather at ${info.reporttime}`);
  }).catch((error) => {
    toast.error('probably network error', error);
    info.status = 0;
  });
}
onMounted(() => {
  getWeather();
  setInterval(getWeather, 600000);
});

// 用的是高德地图的 api，自己手机号申请的。apikey:28589df0732b94de2d2d9f10c29ec146
// 深圳 adcode:440300 或者 罗湖 adcode:440303 (这里用的是深圳，可能会有误差)
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
  访问 https://restapi.amap.com/v3/weather/weatherInfo?key=28589df0732b94de2d2d9f10c29ec146&city=440300&extensions=base&output=JSON 可直接获取 JSON 结果
*/
// 原版
</script>
