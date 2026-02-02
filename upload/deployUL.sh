#!/bin/bash

echo "🚀 Bắt đầu deploy Upload Service..."

# Cấu hình Server
SERVER_IP="74.50.113.73"
SERVER_PORT="22"
SERVER_USER="root"
REMOTE_DIR="/var/www/roam/upload"
APP_NAME="upload-service"

# 1. Build Go Binary cho Linux
echo "🔨 Building binary for Linux..."
set -e
GOOS=linux GOARCH=amd64 go build -o $APP_NAME main.go

# 2. Nén file
echo "📦 Zipping files..."
zip -r upload_build.zip $APP_NAME .env.example

# 3. Upload lên server
echo "📤 Uploading to server..."
sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" upload_build.zip "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# 4. SSH vào server để giải nén và chạy
echo "🔧 Configuring on server..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP" << EOF
    mkdir -p $REMOTE_DIR
    mkdir -p $REMOTE_DIR/uploads
    cd $REMOTE_DIR

    # Giải nén
    unzip -o upload_build.zip
    rm upload_build.zip
    chmod +x $APP_NAME

    # Tạo file .env nếu chưa có
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        echo "PORT=8089" > .env
        echo "HOST=0.0.0.0" >> .env
        # QUAN TRỌNG: Cấu hình domain trả về tại đây
        echo "BASE_URL=https://jobzesty.com" >> .env
        echo "UPLOAD_DIR=./uploads" >> .env
        echo "ALLOWED_ORIGINS=*" >> .env
    fi

    # Restart service (Dùng PM2 để quản lý process Go)
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart $APP_NAME
    else
        pm2 start ./$APP_NAME --name "$APP_NAME"
    fi

    pm2 save
EOF

# Dọn dẹp local
rm -f $APP_NAME upload_build.zip
echo "✅ Deploy thành công!"
