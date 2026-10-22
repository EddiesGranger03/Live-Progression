# Kế hoạch bảo trì

Kế hoạch này tập trung vào các giới hạn đã ghi nhận trong [README](../README.md) và [báo cáo kiểm chứng](VERIFICATION.md). Hạng mục cần duy trì sẽ được theo dõi bằng GitHub Issues để có lịch sử thảo luận, người nhận và trạng thái rõ ràng.

## Việc đang cần theo dõi

| Ưu tiên | Hạng mục | Điều kiện hoàn tất |
| --- | --- | --- |
| Cao | [Kiểm thử bảo vệ Focus Android trên thiết bị thật](https://github.com/EddiesGranger03/Live-Progression/issues/1) | Ghi rõ model/Android/API, quyền được cấp, kết quả nhắc/che/bỏ qua/tắt bảo vệ; kiểm tra không đọc nội dung app và không áp dụng khi Focus tắt. |
| Cao | [Xây dựng iOS Screen Time restriction đúng entitlement](https://github.com/EddiesGranger03/Live-Progression/issues/2) | Apple cấp Family Controls entitlement; app/extension Swift được build, ký, chạy và kiểm tra luồng chọn app/cho phép/ngắt bảo vệ. Nếu entitlement chưa có thì tiếp tục ghi trạng thái chưa hỗ trợ. |
| Trung bình | [Kiểm tra email đặt lại mật khẩu ở staging](https://github.com/EddiesGranger03/Live-Progression/issues/3) | Cấu hình SMTP từ secret store, xác nhận gửi/reset token hết hạn và không ghi token vào log. |
| Trung bình | [Chuẩn bị backend cho production](https://github.com/EddiesGranger03/Live-Progression/issues/4) | Quyết định PostgreSQL và migrations, backup/restore, rate limit bền vững, HTTPS, logging và kiểm thử tải; cập nhật tài liệu triển khai trước khi mở dịch vụ công khai. |
| Trung bình | [Rà 5 cảnh báo npm audit trong build toolchain](https://github.com/EddiesGranger03/Live-Progression/issues/5) | Xác định phạm vi runtime/build, chọn bản vá tương thích Angular/Capacitor, chạy lại CI; không hạ cấp hoặc dùng `--force` khi chưa đánh giá. |

Các mục trên là việc cần hoàn thiện, không phải lỗi đã tái hiện hay tính năng đã phát hành. Không có bug production, số người dùng hay phản hồi thật nào được ghi nhận tại thời điểm phiên bản này.

## Nhịp bảo trì

- Mỗi pull request vào `main` phải qua workflow CI; reviewer kiểm tra ảnh hưởng, migration/API và giới hạn quyền.
- Hàng tháng: rà dependency frontend/backend/native, GitHub Actions, cảnh báo bảo mật và Issue quá hạn; chỉ nâng phiên bản sau khi CI đạt.
- Mỗi bản phát hành: cập nhật `CHANGELOG.md`, `package.json`/lockfile khi đổi phiên bản, tạo tag `vX.Y.Z`, ghi rõ kiểm thử, thay đổi và giới hạn chưa xác minh.
- Khi có sự cố dữ liệu hoặc quyền: tắt phần bị ảnh hưởng trước, ghi timeline và biện pháp khắc phục trong Issue công khai nhưng không đưa dữ liệu cá nhân vào.

## Mốc phát hành

- `0.2.0`: MVP web và vỏ Android/iOS, mục tiêu và quick action; Android Focus protection có hướng dẫn và đồng ý chủ động. Chi tiết tại [CHANGELOG](../CHANGELOG.md).
- Mốc kế tiếp chưa ấn định ngày; phụ thuộc kết quả kiểm thử Android thực tế, entitlement iOS và ưu tiên vận hành backend.
