# Changelog

Các thay đổi đáng chú ý của Solo Leveling được ghi theo phiên bản. Phiên bản tuân theo Semantic Versioning khi phạm vi sản phẩm ổn định hơn.

## [0.2.0] - 2026-10-22

Đây là mốc MVP đang có trong `package.json`; nội dung mô tả trạng thái mã nguồn, không khẳng định ứng dụng đã phát hành trên store.

### Thêm mới

- Luồng mục tiêu độc lập, liên kết nhiệm vụ với mục tiêu và thao tác nhanh “Tôi có vài phút”.
- Vỏ ứng dụng Capacitor cho Android và iOS; tích hợp Android opt-in để nhắc/che ứng dụng đã chọn trong phiên Focus.
- Bộ thiết kế di động 84 trạng thái cho Android/iOS, hướng dẫn sử dụng, prompt và contact sheet.
- Tài liệu đóng góp, GitHub Issue forms, CI và bằng chứng demo emulator.

### Cập nhật

- Giữ bốn khu vực điều hướng, XP +20 cho nhiệm vụ đã xác nhận, một Level mỗi 200 XP và hoàn tác trong 10 phút.
- Ghi nhận đồng bộ mục tiêu ở SQLite/API và bổ sung kiểm thử migration/nghiệp vụ.

### Giới hạn đã biết

- iOS Screen Time restriction chưa được triển khai. Xcode CI đã build thành công cho iOS Simulator; app chưa được ký hoặc kiểm thử trên thiết bị thật.
- Android overlay chưa được kiểm thử end-to-end trên thiết bị có ứng dụng mạng xã hội và quyền hệ thống đã bật.
- Chưa có số liệu người dùng, tải xuống, retention hoặc phản hồi production được xác nhận.
- SMTP, vận hành production nhiều instance và quy trình duyệt Google Play còn cần cấu hình/kiểm tra riêng.
