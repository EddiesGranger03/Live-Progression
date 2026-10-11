# Solo Leveling — Web MVP v0.2

Website tiếng Việt theo bản đồ màn hình v0.2 và các ảnh navy được cung cấp. Bốn mục điều hướng: Hôm nay, Lịch, Tiến bộ, Cá nhân. Nhiệm vụ và Focus nằm trong luồng, không thêm tab riêng.

## Mở nhanh trên máy này

Nhấp đúp `Mo-Solo-Leveling.cmd`, rồi mở **http://127.0.0.1:8000**. Cần Node.js 24.15+ và Python 3.11+. Bản build đã có trong `dist`, vì vậy không cần build lại để xem.

Hoặc dùng PowerShell tại thư mục dự án:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start.ps1
```

Tạo tài khoản riêng từ trang Đăng nhập → Tạo tài khoản. Tài khoản mới bắt đầu Level 1, 0 XP, không có dữ liệu mẫu. Chọn “Mở bản trải nghiệm” nếu muốn xem thiết kế có dữ liệu Gia Long.

## Hai chế độ

| Chế độ | Tài khoản và lưu dữ liệu |
| --- | --- |
| FastAPI local, cổng 8000 | Đăng ký/đăng nhập thực; cookie HttpOnly; SQLite trong `data/solo.db`; dữ liệu tách theo tài khoản. |
| Website trải nghiệm trên Sites hoặc preview cổng 4173 | Angular với dữ liệu mẫu; lưu localStorage trên thiết bị. Không có backend Python hay tài khoản cloud ở hosting tĩnh. |

Link Sites là bản riêng tư của người sở hữu. Muốn nhóm test dùng API qua Internet cần triển khai FastAPI và cấu hình quyền chia sẻ phù hợp.

## Đã triển khai

- Giao diện navy, avatar SVG gốc, font Be Vietnam Pro tự phục vụ; responsive từ 360px; thanh điều hướng dưới trên mobile.
- Trang tổng quan, lịch ngày/chuyển ngày/chọn ngày, nhiệm vụ/tìm kiếm/lọc, chi tiết nhiệm vụ, tiến bộ 7 ngày/nhật ký ngày, hồ sơ và onboarding 3 bước.
- Tạo/sửa/lưu trữ nhiệm vụ, đặt nhiệm vụ có sẵn vào lịch, tạo/sửa/xóa khung bận/Focus/nghỉ, cảnh báo và xác nhận khung trùng.
- Gợi ý theo mục tiêu, giờ hoạt động/giờ nghỉ, đệm 5 phút, khoảng ít nhất 15 phút và tối đa 2 gợi ý. Không suy ra cả ngày rảnh nếu chưa nhập lịch.
- Timer dựa trên timestamp; khôi phục sau tải lại; chỉ một phiên active; kết thúc sớm giữ nhiệm vụ pending. Hết giờ không tự cấp XP.
- Xác nhận hoàn thành +20 XP; transaction và mutation ID chống cấp trùng; hoàn tác trong 10 phút bằng ledger đảo; sửa nhiệm vụ đã xong chỉ cho tên/ghi chú. Level = 1 + floor(XP/200).
- Tài khoản, phân quyền dữ liệu, hash PBKDF2 với salt, logout thu hồi phiên, xóa dữ liệu tài khoản local có xác nhận XÓA.
- Cache trong phiên trình duyệt khi mất mạng; thao tác chờ đồng bộ; XP dự kiến có nhãn riêng; xung đột giữ bản nháp và cho xem lại. Timer đang có vẫn được khôi phục.
- Tùy chọn lời nhắc khi timer kết thúc, xin quyền thông báo chỉ khi bấm, giới hạn theo giờ hoạt động và số lượng. Cần giữ ứng dụng mở; không có push nền khi trình duyệt đã đóng.
- Modal native giữ focus, Escape bảo vệ bản nháp chưa lưu; lỗi giữ dữ liệu nhập.

## Email đặt lại mật khẩu

Luồng và API đã có, nhưng cần SMTP của bạn để gửi email thực. Sao chép `.env.example` thành `.env`, điền SMTP và `SOLO_PUBLIC_URL`, rồi khởi động lại bằng `start.ps1`. Không có SMTP thì API trả thông báo chưa cấu hình; không giả vờ đã gửi email. Token đặt lại hết hạn sau 30 phút, lưu dạng hash, dùng một lần và thu hồi phiên cũ sau đổi mật khẩu. Chưa có email xác minh tài khoản.

## Phát triển và kiểm thử

```powershell
npm ci
npm run build
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests -q --basetemp artifacts/pytest-local
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Để phát triển frontend: `npm start` tại cổng 4200, proxy API sang 8000. OpenAPI: **http://127.0.0.1:8000/docs**. Preview dữ liệu mẫu: `node scripts/preview.mjs`.

Kiểm tra Edge tự động (cần Edge được cài và các server tương ứng đang chạy):

```powershell
node scripts/verify.mjs
node scripts/verify-server.mjs
```

Kết quả và ảnh nằm trong `artifacts`. Các kiểm thử backend dùng database tạm riêng; browser server test tạo và xóa đúng tài khoản kiểm thử của nó.

## Cấu trúc và giới hạn triển khai

`frontend/src/app/features` chứa các trang Angular lazy load; `core` chứa model, store và adapter demo/API; `shared` chứa UI dùng chung. `backend/app/domain.py` chứa quy tắc thuần Python, `application.py` điều phối nghiệp vụ/transaction, `database.py` là SQLite adapter, `main.py` là HTTP/auth/composition. Ba tài liệu kiến trúc nằm trong `docs/architecture`.

Đây là bản MVP để chạy và kiểm chứng, chưa có số liệu kiểm tải hay vận hành production. SQLite/rate limit trong bộ nhớ phù hợp chạy local; trước triển khai nhiều instance cần PostgreSQL, migrations, backup/restore, auth/email provider, HTTPS và kiểm thử tải. Khởi tạo database v1 tự động; chưa có dữ liệu legacy để migrate. Xóa tài khoản xóa ngay database đang chạy, không tự tuyên bố chính sách lưu/xóa backup 30 ngày.

Chưa thuộc web MVP: iPhone Screen Time, chặn mạng xã hội ở hệ điều hành, Google Calendar OAuth, AI/Computer Vision, GPS, marketplace, thanh toán. Phút timer không phải thời gian tập trung đã xác minh.

Font Be Vietnam Pro theo SIL Open Font License, đóng gói qua `@fontsource/be-vietnam-pro`; avatar/logo SVG được vẽ riêng cho bản dựng. Tham khảo kỹ thuật: [Angular compatibility](https://angular.dev/reference/versions), [FastAPI security](https://fastapi.tiangolo.com/tutorial/security/).
