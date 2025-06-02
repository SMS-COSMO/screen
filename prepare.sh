# This script ONLY installs Caddy & MinIO.
# For Node.js and pnpm, please install manually

echo "Installing Caddy..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

echo "Installing MinIO..."
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20250524170830.0.0_amd64.deb -O minio.deb
sudo dpkg -i minio.deb
