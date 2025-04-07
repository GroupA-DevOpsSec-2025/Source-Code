#!/usr/bin/env bash
set -e  # Exit immediately if any command fails

# Deployment directory
DEPLOY_DIR="$HOME/Source-Code"
echo "Deploying to: $DEPLOY_DIR"

# Clean previous deployment if exists
if [ -d "$DEPLOY_DIR" ]; then
  echo "Removing existing deployment directory..."
  rm -rf "$DEPLOY_DIR"
fi

# Clone repository
echo "Cloning repository..."
git clone -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Verify repository contents
echo "Repository contents:"
ls -la

# Install Node.js if needed
if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx
  sudo npm install -g npm@latest pm2
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Deploy frontend
echo "Deploying frontend..."
sudo rm -rf /var/www/html/*
sudo cp -a build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/todo-app >/dev/null <<'EOF'
server {
  listen 80;
  server_name _;
  root /var/www/html;
  
  location / {
    try_files $uri /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Content-Type $content_type;
    proxy_buffering off;
    proxy_read_timeout 300s;
  }
}
EOF

# Enable Nginx config
sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Setup backend
echo "Setting up backend..."
cd server
npm install

# Start with PM2
echo "Starting backend..."
pm2 delete todo-api 2>/dev/null || true
pm2 start ./bin/www --name todo-api --wait-ready
pm2 save
pm2 startup || true

# Restart Nginx
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "Deployment successful!"
echo "Frontend: http://$EC2_PUBLIC_DNS"
echo "API: http://$EC2_PUBLIC_DNS/api/todos"