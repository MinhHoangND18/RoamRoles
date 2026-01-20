# Script để tạo file .env cho API
# Chạy script này: .\create-env.ps1

$envContent = @"
# API Server Configuration
PORT=8088
HOST=127.0.0.1

# Database Configuration
# For MySQL: mysql://user:password@localhost:3306/dbname
# For SQLite: sqlite://./database.db
DB_URL=mysql://root:password@localhost:3306/roamroles

# API Secret Key
API_SECRET=your-api-secret-key-here
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
Write-Host "⚠️  QUAN TRỌNG: Bạn cần chỉnh sửa file .env và:" -ForegroundColor Yellow
Write-Host "   1. Cập nhật DB_URL với thông tin database thực tế của bạn" -ForegroundColor Yellow
Write-Host "   2. Thay đổi API_SECRET thành một giá trị bảo mật" -ForegroundColor Yellow
