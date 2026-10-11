@echo off
chcp 65001 >nul
cd /d "%~dp0"
docker compose up -d --build --wait --wait-timeout 120
if errorlevel 1 (
  echo Khong khoi dong duoc. Hay mo Docker Desktop va xem loi ben tren.
  pause
  exit /b 1
)
echo Solo Leveling da san sang. Cong mac dinh: http://localhost:8080
pause
