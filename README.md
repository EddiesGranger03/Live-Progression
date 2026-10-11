# Solo Leveling — Web MVP v0.2

**Solo Leveling là sản phẩm của startup LP (Live Progresssion).**

Website tiếng Việt theo bản đồ màn hình v0.2 và các ảnh navy được cung cấp. Bốn mục điều hướng: Hôm nay, Lịch, Tiến bộ, Cá nhân. Nhiệm vụ và Focus nằm trong luồng, không thêm tab riêng.

## Đội ngũ dự án

| Thành viên | Vai trò trong dự án | Phụ trách |
| --- | --- | --- |
| **Nguyễn Vũ Gia Long** | Người sáng lập (Founder), Business Analyst (BA) | Truyền thông, giới thiệu dự án, phân tích nghiệp vụ và yêu cầu sản phẩm. |
| **Nguyễn Khánh Sơn** | Đồng sáng lập (Co-founder), Developer | Phát triển phần mềm và kỹ thuật. |

Đây là vai trò của đội ngũ xây dựng sản phẩm. Quyền tài khoản trong ứng dụng được thiết kế riêng theo nhu cầu vận hành; xem [đề xuất phân quyền](docs/ACCESS_CONTROL_PLAN.md).

## Mã nguồn để đưa lên GitHub

**Dùng thư mục `solo-leveling` này làm repository duy nhất.** Mã nguồn đã gồm Angular, FastAPI và Docker; không cần tạo hai repository MVP/Docker.

| Bản trên Desktop | Mục đích |
| --- | --- |
| `solo-leveling/` | Mã nguồn đang phát triển, dùng để commit/push lên GitHub. |
| `Solo_Leveling_GitHub_Ready.zip` | Gói nguồn sạch từ commit đã chuẩn bị, gồm Docker và chia sẻ HTTPS; không chứa dữ liệu riêng, dependency hay bản build. |
| `Solo_Leveling_Packages/archive/` | Lưu hai ZIP bàn giao MVP/Docker trước đây để tham khảo. |

Commit `frontend/`, `backend/`, `docs/`, `scripts/`, `Dockerfile`, các file Compose, `.dockerignore`, `.gitignore`, `.gitattributes`, các file cấu hình và lockfile. `.gitignore` loại dependency/build/cache, `.env` thực, database, dữ liệu người dùng, ZIP và cấu hình hosting cục bộ; hai file `.env.example` và `.env.docker.example` được giữ làm mẫu. Hướng dẫn kiểm tra và kết nối GitHub nằm trong [docs/GITHUB.md](docs/GITHUB.md).

## Mở nhanh trên máy này

Nhấp đúp `Mo-Solo-Leveling.cmd`, rồi mở **http://127.0.0.1:8000**. Cần Node.js 24.15+ và Python 3.11+. `start.ps1` tự build frontend lần đầu nếu chưa có `dist`; bản build trên máy này được giữ để mở nhanh. Gói GitHub Ready chứa mã nguồn, Docker tự build khi chạy.

Hoặc dùng PowerShell tại thư mục dự án:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start.ps1
```

Tạo tài khoản riêng từ trang Đăng nhập → Tạo tài khoản. Tài khoản mới bắt đầu Level 1, 0 XP, không có dữ liệu mẫu. Chọn “Mở bản trải nghiệm” nếu muốn xem thiết kế có dữ liệu Gia Long.

## Chạy bằng Docker Desktop

Mở Docker Desktop ở chế độ Linux containers. Nhấp đúp `Mo-Solo-Leveling-Docker.cmd`, hoặc chạy tại thư mục dự án:

```powershell
docker compose up -d --build --wait --wait-timeout 120
```

Mở **http://localhost:8080**. Docker tự build Angular và cài Python trong image; máy chỉ cần Docker Desktop, không cần cài Node.js/Python. API và giao diện chạy chung container `web`; API docs tại **http://localhost:8080/docs**. Lần build đầu cần Internet để tải base image và dependency.

SQLite được lưu trong volume `solo-leveling_solo_data`, độc lập với thư mục `data` khi chạy trực tiếp bằng Python. Tài khoản và dữ liệu vẫn còn sau khi restart, build lại hoặc `docker compose down` rồi bật lại. Image không chứa database trên máy, `.env`, mật khẩu SMTP hay các tài khoản cũ. Container chạy bằng user thường, filesystem chỉ đọc; riêng thư mục dữ liệu có quyền ghi.

```powershell
docker compose ps
docker compose logs --tail 100 web
docker compose restart web
docker compose down
docker compose up -d --wait
```

`down` dừng và gỡ container của dự án. **Không thêm `-v` nếu muốn giữ dữ liệu**, vì cờ đó xóa volume. Docker chỉ mở cổng trên máy này qua `127.0.0.1`.

Nếu muốn đổi cổng hoặc cấu hình email, sao chép `.env.docker.example` thành `.env`, sửa các giá trị rồi chạy lại `docker compose up -d --build --wait`. Khi đổi `SOLO_PORT`, cập nhật cả `SOLO_PUBLIC_URL` và `SOLO_ALLOWED_ORIGINS`. Nếu đã có `.env` từ cách chạy Python ở cổng 8000, cập nhật URL cho cổng Docker đang dùng. Không commit `.env`.

## Chia sẻ bản đầy đủ cho Long qua Internet

Nhấp đúp **`Chia-Se-Cho-Long.cmd`**. Script build/chạy Docker, tạo Cloudflare Quick Tunnel và in link HTTPS dạng `https://…trycloudflare.com`. Gửi link đó cho Long; Long chọn **Tạo tài khoản** để có dữ liệu riêng trên backend FastAPI. Không gửi link `localhost`, vì địa chỉ đó chỉ mở trên chính máy bạn.

Máy, Docker và kết nối Internet cần tiếp tục hoạt động. Link là bản thử tạm, đổi khi tạo lại tunnel; không phải hosting độc lập 24/7. Dữ liệu nằm trong Docker volume hiện tại và không mất khi tắt link. Nhấp **`Tat-Link-Chia-Se.cmd`** để ngừng chia sẻ; website local vẫn chạy. Link mới nhất được lưu tại `artifacts/share-link.txt`, được Git bỏ qua.

Chi tiết vận hành và hướng triển khai ổn định: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Hai chế độ

| Chế độ | Tài khoản và lưu dữ liệu |
| --- | --- |
| FastAPI local cổng 8000, hoặc Docker cổng 8080 | Đăng ký/đăng nhập thực; cookie HttpOnly; SQLite trong `data/solo.db` hoặc Docker volume; dữ liệu tách theo tài khoản. |
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

Luồng và API đã có, nhưng cần SMTP của bạn để gửi email thực. Sao chép `.env.example` thành `.env` khi chạy Python, hoặc dùng `.env.docker.example` khi chạy Docker; điền SMTP và `SOLO_PUBLIC_URL`, rồi khởi động lại bằng `start.ps1` hoặc `docker compose up -d`. Không có SMTP thì API trả thông báo chưa cấu hình; không giả vờ đã gửi email. Token đặt lại hết hạn sau 30 phút, lưu dạng hash, dùng một lần và thu hồi phiên cũ sau đổi mật khẩu. Chưa có email xác minh tài khoản.

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

Kiểm tra Docker đang chạy ở cổng 8080 (script Python restart rồi tạo lại riêng container `web`, giữ volume và xóa tài khoản kiểm thử sau khi xong):

```powershell
python scripts/verify-docker.py
$env:SOLO_TEST_URL='http://localhost:8080'
node scripts/verify-server.mjs
```

Kết quả và ảnh nằm trong `artifacts`. Các kiểm thử backend dùng database tạm riêng; browser server test tạo và xóa đúng tài khoản kiểm thử của nó.

## Cấu trúc và giới hạn triển khai

`frontend/src/app/features` chứa các trang Angular lazy load; `core` chứa model, store và adapter demo/API; `shared` chứa UI dùng chung. `backend/app/domain.py` chứa quy tắc thuần Python, `application.py` điều phối nghiệp vụ/transaction, `database.py` là SQLite adapter, `main.py` là HTTP/auth/composition. Ba tài liệu kiến trúc nằm trong `docs/architecture`.

Đây là bản MVP để chạy và kiểm chứng, chưa có số liệu kiểm tải hay vận hành production. SQLite/rate limit trong bộ nhớ phù hợp chạy local; trước triển khai nhiều instance cần PostgreSQL, migrations, backup/restore, auth/email provider, HTTPS và kiểm thử tải. Khởi tạo database v1 tự động; chưa có dữ liệu legacy để migrate. Xóa tài khoản xóa ngay database đang chạy, không tự tuyên bố chính sách lưu/xóa backup 30 ngày.

Chưa thuộc web MVP: iPhone Screen Time, chặn mạng xã hội ở hệ điều hành, Google Calendar OAuth, AI/Computer Vision, GPS, marketplace, thanh toán. Phút timer không phải thời gian tập trung đã xác minh.

Font Be Vietnam Pro theo SIL Open Font License, đóng gói qua `@fontsource/be-vietnam-pro`; avatar/logo SVG được vẽ riêng cho bản dựng. Tham khảo kỹ thuật: [Angular compatibility](https://angular.dev/reference/versions), [FastAPI security](https://fastapi.tiangolo.com/tutorial/security/).
