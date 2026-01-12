
echo "📤 Upload code lên server..."
SERVER_IP="74.50.113.73"
SERVER_PORT="22"
SERVER_USER="root"

REMOTE_DIR=/var/www/roam/fe
NODE_ENV="production"

WORKING_DIR=$(pwd)
rm -Rf out

npm run build
# mv out $WORKING_DIR
# cd $WORKING_DIR

# Đóng gói dist thành zip
echo "📦 Zipping build..."
rm -f frontend_build.zip
zip -r frontend_build.zip out

# Upload zip lên server (dùng sshpass)
echo "📤 Uploading zip..."

sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" frontend_build.zip "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# Giải nén trên server (dùng sshpass)
echo "🚀 Deploying on server..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP" << EOF
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR
rm -rf frontend 
unzip -o frontend_build.zip
mv out frontend
rm frontend_build.zip
EOF

echo "✅ Done!"
