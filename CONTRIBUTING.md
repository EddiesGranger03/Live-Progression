# Hướng dẫn đóng góp

Cảm ơn bạn muốn cải thiện Solo Leveling. Dự án hiện là MVP; hãy mở GitHub Issue trước khi bắt đầu thay đổi lớn để thống nhất phạm vi và tránh làm sai quy tắc sản phẩm.

## Bắt đầu

1. Fork repository và tạo nhánh từ `main`. Dùng tên nhánh ngắn bằng tiếng Anh, ví dụ `fix/focus-timer` hoặc `feat/goal-archive`.
2. Cài môi trường theo [README](README.md): Node.js 24.15+, Python 3.11+, npm và (nếu sửa native Android) JDK 21 cùng Android SDK.
3. Cài dependency và chạy kiểm tra liên quan:

   ```powershell
   npm ci
   npm run check
   npm run build
   python -m pip install -r backend/requirements.txt
   python -m pytest backend/tests -q --basetemp artifacts/pytest-local
   ```

   Với Android, chạy `npm run mobile:sync`, sau đó `android\gradlew.bat assembleDebug`. iOS cần macOS/Xcode; việc build iOS chưa được xác nhận trong môi trường phát triển hiện tại.

## Quy ước thay đổi

- Giữ UI và thông báo cho người dùng bằng tiếng Việt; tên biến, hàm, file và commit message bằng tiếng Anh.
- Giữ nguyên quy tắc XP: hoàn thành nhiệm vụ được +20 XP, mỗi 200 XP lên một Level; hoàn tác trong 10 phút. Timer kết thúc không tự hoàn thành nhiệm vụ hoặc cấp XP.
- Bảo vệ ứng dụng mạng xã hội phải luôn do người dùng tự bật, gắn với Focus, giải thích rõ quyền và cho phép bỏ qua/tắt. Không ghi nội dung màn hình, tin nhắn, cuộc gọi hoặc thao tác nhập.
- Không đưa dữ liệu thật của người dùng, database, `.env`, token, ảnh đăng nhập/OTP, browser profile hoặc bản build vào pull request. Dùng dữ liệu minh họa.
- Thay đổi backend cần kiểm tra nghiệp vụ trong pytest; thay đổi UI cần kiểm tra responsive và trạng thái lỗi/rỗng; thay đổi native cần ghi rõ thiết bị/quyền đã kiểm chứng.
- Không đổi API, migration, dependency lớn hoặc quy tắc nghiệp vụ ngầm. Mở Issue để thảo luận trước.

## Pull request

PR nên giải quyết một mục tiêu, nêu hành vi trước/sau, liên kết Issue và ghi kết quả kiểm tra. Trước khi gửi, xác nhận:

- [ ] `npm run check` và `npm run build` đạt nếu có thay đổi frontend.
- [ ] `python -m pytest backend/tests -q` đạt nếu có thay đổi backend.
- [ ] CI thành công; nếu không thể chạy kiểm tra native, ghi rõ lý do.
- [ ] Không chứa bí mật, dữ liệu cá nhân, output build hay ảnh chụp tài khoản thật.
- [ ] Tài liệu và ảnh demo phản ánh đúng những gì đã chạy; ghi riêng giới hạn chưa kiểm chứng.

Commit message viết bằng tiếng Anh, ngắn gọn và ở thì mệnh lệnh, ví dụ `Add Android focus protection status`.

## Báo lỗi và đề xuất

Dùng GitHub Issue form để báo lỗi hoặc đề xuất tính năng/bảo trì. Trước khi gửi lỗi, kiểm tra phiên bản, trình duyệt/thiết bị và các Issue đang mở. Không đăng email cá nhân, token, log chứa dữ liệu riêng hoặc ảnh màn hình có thông tin nhạy cảm.
