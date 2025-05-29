if ! command -v caddy >/dev/null 2>&1; then
  echo "Installing Caddy..."
  sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt update
  sudo apt install caddy

echo "Installing dependencies..."
pnpm config set registry https://registry.npmmirror.com
pnpm i

echo "Building..."
pnpm build

echo "Launching..."
pm2 start ecosystem.config.cjs
caddy run
