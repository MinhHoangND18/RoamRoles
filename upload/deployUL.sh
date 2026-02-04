#!/bin/bash

IP_SERVER="74.50.113.73"
USER_SERVER="root"
TARGET_DIR="/var/www/roam/upload"
BINARY_NAME="api-roam-upload-new"
GOOS=linux GOARCH=amd64 go build -o $BINARY_NAME main.go

sshpass -p "$PASS_SERVER" scp $BINARY_NAME $USER_SERVER@$IP_SERVER:$TARGET_DIR

sshpass -p "$PASS_SERVER" ssh $USER_SERVER@$IP_SERVER  << 'EOF'
export NVM_DIR="$HOME/.nvm"
TARGET_DIR="/var/www/roam/upload"

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

cd $TARGET_DIR

mv api-roam-upload-new api-roam-upload

chmod +x api-roam-upload

pm2 restart api-roam-upload

EOF