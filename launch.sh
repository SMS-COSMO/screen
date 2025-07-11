echo "Installing dependencies..."
pnpm i

echo "Building..."
pnpm build

echo "Launching..."
sudo systemctl start minio.service
pm2 start ecosystem.config.cjs
