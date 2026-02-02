#!/bin/bash

echo "📤 Deploying Upload Service..."

# Cấu hình Server
SERVER_IP="74.50.113.73"
SERVER_USER="root"
REMOTE_DIR="/var/www/roam/upload"
LOCAL_BINARY="upload-service-linux"

# 1. Build Go Binary cho Linux (từ máy local Windows/Mac)
echo "🔨 Building Go binary..."
# Lưu ý: Đảm bảo bạn đang đứng ở thư mục upload khi chạy script hoặc điều chỉnh đường dẫn
export GOOS=linux
export GOARCH=amd64
go build -o $LOCAL_BINARY main.go

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# 2. Upload lên Server
echo "🚀 Uploading to $SERVER_IP..."
# Tạo thư mục nếu chưa có
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/uploads"

# Copy file chạy và .env
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no $LOCAL_BINARY $SERVER_USER@$SERVER_IP:$REMOTE_DIR/upload-service
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no .env $SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env 2>/dev/null || echo "⚠️ Warning: No .env file found locally to upload."

# 3. Restart Service trên Server (dùng PM2)
echo "🔄 Restarting service..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    chmod +x upload-service
    
    # Start hoặc Restart PM2 với tên roam-upload
    pm2 start ./upload-service --name roam-upload 2>/dev/null || pm2 restart roam-upload
    pm2 save
EOF

# Dọn dẹp file local
rm $LOCAL_BINARY
echo "✅ Deployment Complete! Service running on port 8089"
