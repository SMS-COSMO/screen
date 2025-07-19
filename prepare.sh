# This script installs pm2, MinIO and MinIO Client.
# IMPORTANT: You'll have to add MinIO Client to PATH manually.

echo "Installing pnpm & Node.js..."
curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm config set registry https://registry.npmmirror.com
pnpm env use --global lts
pnpm add -g corepack

echo "Installing PM2..."
pnpm add -g pm2

echo "Installing MinIO and MinIO Client..."
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20250524170830.0.0_amd64.deb -O minio.deb
sudo dpkg -i minio.deb
rm -f minio.deb
curl https://dl.min.io/client/mc/release/linux-amd64/mc \
  --create-dirs \
  -o $HOME/minio-binaries/mc
chmod +x $HOME/minio-binaries/mc
