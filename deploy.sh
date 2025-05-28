pnpm config set registry https://registry.npmmirror.com
pnpm i
pnpm build
pm2 start ecosystem.config.cjs
