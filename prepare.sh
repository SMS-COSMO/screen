# This script ONLY installs MinIO.
# For Node.js and pnpm, please install manually

echo "Installing MinIO..."
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20250524170830.0.0_amd64.deb -O minio.deb
sudo dpkg -i minio.deb
