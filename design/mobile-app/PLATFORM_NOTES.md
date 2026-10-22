# Khác biệt nền tảng và nguồn kiểm tra
Đối chiếu ngày 15/10/2026. Nguồn chính thức; không dùng nội dung diễn đàn làm cam kết.

## iOS
- Family Controls là hướng xin quyền quản lý; thiết kế B02 là giải thích trước quyền hệ thống, không phải mô phỏng hộp thoại Apple chính xác. [Apple Family Controls](https://developer.apple.com/documentation/familycontrols)
- Hành động đóng trong shield có API riêng. B04 dùng “Đóng ứng dụng này”, không mặc định nút mở trực tiếp app chính ở mọi phiên bản. [ShieldActionResponse.close](https://developer.apple.com/documentation/managedsettings/shieldactionresponse/close)
- API hiện có nhiều phản hồi shield; availability phải được đội native kiểm tra cho phiên bản OS tối thiểu trước khi đổi CTA. [ShieldActionResponse](https://developer.apple.com/documentation/managedsettings/shieldactionresponse)
- Lịch thiết bị được đọc qua EventKit; quyền hệ thống và cách xin quyền phụ thuộc phiên bản. Bộ thiết kế giới hạn sử dụng dữ liệu theo hướng chỉ đọc; đây không phải Google OAuth. [Accessing the event store](https://developer.apple.com/documentation/eventkit/accessing-the-event-store)
- Phát hành Family Controls và extension có điều kiện entitlement; kiểm tra riêng khi triển khai. [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)

## Android
- UsageStatsManager phục vụ truy vấn thống kê sử dụng. Quyền truy cập dữ liệu sử dụng không tự là một cơ chế khóa ứng dụng. B01 không suy ra trạng thái bảo vệ từ quyền này. [Android UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- Nếu chọn AccessibilityService cho mẫu thử, việc khai báo và giải thích/đồng ý phải theo chính sách phù hợp. B02 đưa giải thích trước bước cài đặt; chưa chọn đây là cơ chế chắc chắn được phê duyệt. [Google Play AccessibilityService policy](https://support.google.com/googleplay/android-developer/answer/10964491?hl=en)
- B04 Android là concept ngắt hành vi, không bằng chứng can thiệp được mọi lần mở app. Chọn cơ chế sau thử khả thi, không mặc định dùng quyền quản trị thiết bị cá nhân.
- Xin quyền theo ngữ cảnh và giải thích cho người dùng trước khi chuyển tới cài đặt. [Prominent disclosure and consent](https://support.google.com/googleplay/android-developer/answer/11150561?hl=en)

## Cần kiểm chứng trước phát triển đầy đủ
Chọn app → cấp/từ chối quyền → bắt đầu Focus → mở app bị hạn chế và app được phép → hết giờ/kết thúc sớm → kiểm tra gỡ hạn chế.
Thử thêm thu hồi quyền, đóng app, tiết kiệm pin, reboot, đổi giờ/múi giờ và lịch thay đổi. Báo cáo bằng thiết bị thật, nêu OS và máy thử.

Không thể dùng ảnh giao diện để chứng minh bảo vệ đang hoạt động, callback nền đúng giờ, Google Play/Apple duyệt phân phối hoặc UI đạt accessibility. Các trạng thái bảo vệ trong bộ ảnh là đặc tả thiết kế có điều kiện.

\n