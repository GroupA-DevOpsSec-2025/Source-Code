#!/usr/bin/env bash

# Exit on error
set -e

# Update system and install dependencies
sudo apt-get update
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx
  sudo npm install -g npm@latest pm2
fi

# Clone or pull latest code
if [ -d "Source-Code" ]; then
  cd Source-Code
  git pull origin $BRANCH
else
  git clone -b $BRANCH $REPO_URL Source-Code
  cd Source-Code
fi

# Install dependencies
npm install
npm run build

# Setup frontend
sudo rm -rf /var/www/html/*
sudo cp -a build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Configure Nginx
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

sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Setup backend
cd server
npm install

# Start with PM2
pm2 delete todo-api 2>/dev/null || true
pm2 start ./bin/www --name todo-api --wait-ready
pm2 save
pm2 startup || true

# Restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Verify deployment
echo "Deployment successful!"
echo "Frontend: http://$EC2_PUBLIC_DNS"