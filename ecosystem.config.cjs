module.exports = {
  apps: [
    {
      name: 'Screen',
      script: './.output/server/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        // 以下为环境变量，参考.env.example填写
        NODE_ENV: 'production'
      },
    },
  ],
};