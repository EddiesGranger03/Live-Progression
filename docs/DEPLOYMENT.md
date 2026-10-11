# Chia sẻ và triển khai Solo Leveling của LP

Startup: **LP (Live Progresssion)**. Sản phẩm: **Solo Leveling**.

- **Nguyễn Vũ Gia Long:** người sáng lập, BA, truyền thông và giới thiệu dự án.
- **Nguyễn Khánh Sơn:** đồng sáng lập, developer, phát triển phần mềm và kỹ thuật.

## Link thử đầy đủ ngay từ Docker

Chạy `Chia-Se-Cho-Long.cmd` tại thư mục dự án. Script dùng hai file `compose.yaml` và `compose.share.yaml`: build/chạy service `web` với volume đang có, rồi khởi động `cloudflare/cloudflared` để tạo HTTPS Quick Tunnel. Không cần tài khoản Cloudflare hoặc tên miền.

Sau khi kiểm tra API sẵn sàng, script in link `https://…trycloudflare.com` và lưu vào `artifacts/share-link.txt`. Gửi link này cho Long qua kênh liên lạc của nhóm. Long mở link → **Tạo tài khoản** → đăng nhập và dùng lịch, nhiệm vụ, Focus, XP với dữ liệu riêng. Đây là backend FastAPI thực, không phải link demo lưu localStorage của Sites.

Giữ máy, Docker Desktop và Internet bật. Tắt máy/sleep hoặc ngừng tunnel khiến link không truy cập được. Quick Tunnel không có cam kết uptime và đổi hostname mỗi lần tạo mới. Bật lại bằng file CMD sẽ tạo link mới để gửi lại cho Long. Tham khảo [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

`Tat-Link-Chia-Se.cmd` ngừng và gỡ riêng container tunnel. Website tại `http://localhost:8080` và volume dữ liệu vẫn còn. Trước khi build/tạo lại container web trong lúc đang chia sẻ, tắt tunnel rồi chạy lại file chia sẻ để tunnel dùng đúng network namespace.

## Cấu hình và kiểm tra

Tunnel chỉ đưa HTTP của ứng dụng ra Internet; không mở cổng database, không mount mã nguồn, `.env` hoặc Docker socket. Chỉ cổng localhost trong cùng network namespace được dùng giữa cloudflared và FastAPI. Uvicorn nhận HTTPS qua proxy header từ loopback, nhờ vậy cookie phiên có cờ Secure khi đăng nhập qua link HTTPS. Không cần cho phép mọi địa chỉ gửi proxy header.

Địa chỉ localhost không truy cập được từ máy Long. Link Quick Tunnel cho phép người có link mở trang đăng nhập; dữ liệu cá nhân vẫn yêu cầu phiên đăng nhập và kiểm tra chủ sở hữu. Không tạo tài khoản admin mặc định hay gửi chung mật khẩu tài khoản của Sơn.

Nếu chưa cấu hình SMTP, chức năng email đặt lại mật khẩu vẫn chưa gửi email thực. Nếu cấu hình SMTP khi dùng link tạm, đặt `SOLO_PUBLIC_URL` theo link HTTPS hiện tại và khởi động lại phù hợp; với URL đổi thường xuyên, nên dùng tên miền/tunnel cố định cho email. Luồng email không cần thiết để Long đăng ký và thử sản phẩm lần đầu.

Xem trạng thái/log:

```powershell
docker compose -f compose.yaml -f compose.share.yaml ps
docker compose -f compose.yaml -f compose.share.yaml logs --tail 80 tunnel
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu. Các URL/log thử nằm trong `artifacts`, đã được `.gitignore` loại. Cấu hình chia sẻ không có token Cloudflare hoặc secret để commit.

## Khi cần chạy độc lập 24/7

Chuyển cùng Dockerfile lên máy chủ/container hosting, bật HTTPS và gắn persistent volume tại `/app/data` cho SQLite; chạy một instance trong giai đoạn thử nghiệm. Với nhiều instance, cần chuyển database sang PostgreSQL và hoàn thiện migration, backup/restore, rate limit dùng chung.

Các bước cần có trước khi triển khai ổn định:

1. Repository GitHub của nhóm và tài khoản hosting do nhóm quản lý.
2. Chọn nơi có persistent storage, thống nhất chi phí trước khi tạo tài nguyên tính phí.
3. Deploy Docker image, cấu hình volume và `SOLO_PUBLIC_URL`/origin theo tên miền HTTPS thật; cấu hình trusted proxy theo nền tảng hosting.
4. Kiểm tra đăng ký/đăng nhập, dữ liệu sau restart/deploy, backup và khôi phục.
5. Cấu hình SMTP riêng nếu cần email đặt lại mật khẩu.

Link thử hiện tại phục vụ việc Long đánh giá sản phẩm. Nó không yêu cầu đổi framework, đưa dữ liệu cá nhân lên GitHub hay triển khai trả phí.
