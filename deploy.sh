#!/usr/bin/env bash

# Install dependencies
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get update
  sudo apt-get install -y nodejs nginx
  sudo npm install -g npm@latest pm2
fi

# Clean and setup directories
sudo rm -rf /var/www/html/*
rm -rf ~/Source-Code
mkdir -p ~/Source-Code

# Extract files
tar -xzf /tmp/deploy.tar.gz -C ~/Source-Code
sudo chown -R $EC2_USERNAME:$EC2_USERNAME ~/Source-Code

# Deploy frontend
sudo cp -a ~/Source-Code/build_tmp/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Configure Nginx
sudo mv /tmp/nginx-config /etc/nginx/sites-available/todo-app
sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Setup backend
cd ~/Source-Code/server
npm install

# Start with PM2
pm2 delete todo-api 2>/dev/null || true
pm2 start ./bin/www --name todo-api --wait-ready
pm2 save
pm2 startup || true

# Restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Verify API
echo "Testing API..."
curl -X POST -H "Content-Type: application/json" -d '{"text":"test todo"}' http://localhost:3001/api/todos
curl http://localhost:3001/api/todos

echo ""
echo "Deployment successful!"
echo "Frontend: http://$EC2_PUBLIC_DNS"
echo "API Endpoints:"
echo "  GET    http://$EC2_PUBLIC_DNS/api/todos"
echo "  POST   http://$EC2_PUBLIC_DNS/api/todos"
echo "  PUT    http://$EC2_PUBLIC_DNS/api/todos/:id"
echo "  DELETE http://$EC2_PUBLIC_DNS/api/todos/:id"