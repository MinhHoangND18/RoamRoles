
echo "📤 Upload code lên server..."
SERVER_IP="74.50.113.73"
SERVER_PORT="22"
SERVER_USER="root"

REMOTE_DIR=/var/www/roam/be
NODE_ENV="production"

rm -Rf out
# npm run build

cp -r .next/standalone out
cp -r .next/static ./out/.next/static
cp -r public ./out

# Đóng gói dist thành zip
echo "📦 Zipping build..."
zip -r frontend_build.zip out

# Upload zip lên server (dùng sshpass)
echo "📤 Uploading zip..."

sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" frontend_build.zip "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# Giải nén trên server (dùng sshpass)
echo "🚀 Deploying on server..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP" << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm use 22

export REMOTE_DIR=/var/www/roam/be
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR
rm -rf frontend 
unzip -o frontend_build.zip
mv out frontend
rm frontend_build.zip

pm2 restart roam-be
EOF

echo "✅ Done!"

rm -f frontend_build.zip