#!/usr/bin/env bash
set -e

# System setup
sudo apt-get update
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx
  sudo npm install -g npm@latest pm2
fi

# Application deployment
rm -rf Source-Code
git clone https://github.com/GroupA-DevOpsSec-2025/Source-Code.git
cd Source-Code
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -a build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# SSL Certificate Setup
sudo mkdir -p /etc/ssl/private /etc/ssl/certs
sudo tee /etc/ssl/private/privatekey.pem <<END_PRIVATE_KEY >/dev/null
-----BEGIN PRIVATE KEY-----
$PRIVATE_KEY
-----END PRIVATE KEY-----
END_PRIVATE_KEY

sudo tee /etc/ssl/certs/server.crt <<END_CERTIFICATE >/dev/null
-----BEGIN CERTIFICATE-----
$SERVER_CERT
-----END CERTIFICATE-----
END_CERTIFICATE

sudo chmod 600 /etc/ssl/private/privatekey.pem
sudo chmod 644 /etc/ssl/certs/server.crt

# Nginx Configuration
sudo tee /etc/nginx/sites-available/todo-app <<END_NGINX >/dev/null
server {
  listen 80;
  server_name $EC2_PUBLIC_DNS;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name $EC2_PUBLIC_DNS;
  ssl_certificate /etc/ssl/certs/server.crt;
  ssl_certificate_key /etc/ssl/private/privatekey.pem;
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
  }
}
END_NGINX

# Finalize setup
sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Start server application
chmod +x bin/www
pm2 delete todo-api 2>/dev/null || true
pm2 start ./bin/www --name todo-api
pm2 save
pm2 startup || true

# Restart Nginx
sudo nginx -t && sudo systemctl restart nginx
