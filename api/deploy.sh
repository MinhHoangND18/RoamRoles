#!/bin/bash

# --- Cấu hình ---
IP_SERVER="74.50.113.73"
USER_SERVER="root"
TARGET_DIR="/var/www/roam/api"
BINARY_NAME="api-roam-new"
GOOS=linux GOARCH=amd64 go build -o $BINARY_NAME main.go

sshpass -p "$PASS_SERVER" scp $BINARY_NAME $USER_SERVER@$IP_SERVER:$TARGET_DIR/

sshpass -p "$PASS_SERVER" ssh $USER_SERVER@$IP_SERVER  << 'EOF'
export NVM_DIR="$HOME/.nvm"
TARGET_DIR="/var/www/roam/api"

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

cd $TARGET_DIR
chmod +x api-roam-new
mv api-roam-new api-roam
pm2 restart api-roam
EOF