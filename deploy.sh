#!/usr/bin/env bash
set -e  # Exit immediately if any command fails

# Log the start of deployment
echo "Starting deployment process..."
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"

# Install prerequisites
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git

# Node.js setup if not installed
if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx
  sudo npm install -g npm@latest pm2
fi

# Clone or update repository
echo "Setting up repository..."
if [ -d "Source-Code" ]; then
  echo "Updating existing repository..."
  cd Source-Code
  git fetch origin
  git checkout $BRANCH
  git reset --hard origin/$BRANCH
else
  echo "Cloning new repository..."
  git clone -b $BRANCH $REPO_URL Source-Code
  cd Source-Code
fi

# Install project dependencies
echo "Installing Node.js dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Deploy frontend
echo "Deploying frontend to /var/www/html..."
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

# Enable Nginx configuration
sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Setup backend
echo "Setting up backend..."
cd server
npm install

# Manage PM2 process
echo "Starting backend with PM2..."
pm2 delete todo-api 2>/dev/null || true
pm2 start ./bin/www --name todo-api --wait-ready
pm2 save
pm2 startup || true

# Restart Nginx
echo "Restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Verify deployment
echo ""
echo "Deployment successful!"
echo "Frontend: http://$EC2_PUBLIC_DNS"
echo "Backend API: http://$EC2_PUBLIC_DNS/api/todos"
echo "PM2 Status:"
pm2 list