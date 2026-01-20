# Script để tạo file .env cho BE
# Chạy script này: .\create-env.ps1

$envContent = @"
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3001

# Google OAuth (for login)
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
"@

if (Test-Path .env) {
    Write-Host "File .env đã tồn tại. Bạn có muốn ghi đè không? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Đã hủy." -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath .env -Encoding utf8
Write-Host "✅ Đã tạo file .env thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  QUAN TRỌNG: Bạn cần chỉnh sửa file .env và thêm:" -ForegroundColor Yellow
Write-Host "   1. NEXTAUTH_SECRET: Tạo bằng lệnh 'openssl rand -base64 32' hoặc chuỗi ngẫu nhiên" -ForegroundColor Yellow
Write-Host "   2. GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET từ Google Cloud Console" -ForegroundColor Yellow
Write-Host "      Link: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
