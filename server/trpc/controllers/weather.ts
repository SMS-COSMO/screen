import axios from 'axios';
import { env } from '~/server/env';

const weatherapi = env.WEATHER_API_KEY;
const citycode = env.WEATHER_CITY_CODE;

export class WeatherController {
  async getInfo() {
    const info = {
      status: -1,
      weather: '未知',
      temperature: 0,
      humidity: 0, // 湿度
      reporttime: '',
    };
    await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?key=${weatherapi}&city=${citycode}&extensions=base&output=JSON`).then((response) => {
      const data = response.data;
      info.status = data.status;
      info.weather = data.lives[0].weather;
      info.temperature = data.lives[0].temperature;
      info.humidity = data.lives[0].humidity;
      info.reporttime = data.lives[0].reporttime;
      // if (info.status){...}
    }).catch(() => {
      info.status = 0;
      // console.log('probably network error', error);
    });
    return info;
  }
}
