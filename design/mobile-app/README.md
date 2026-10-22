# Solo Leveling — Bộ thiết kế ứng dụng di động
Bản đầu: 15/10/2026 · Rà soát: 21/10/2026 · Ngôn ngữ: tiếng Việt · Chủ đề: sci-fi dễ dùng.

Bộ hiện tại gồm **84 màn hình/trạng thái và 168 ảnh PNG**, sau khi bổ sung các biến thể còn thiếu ảnh riêng. Các nhóm chính đã có từ bản đầu; không coi mỗi tổ hợp dữ liệu là một màn hình mới.

## Mở bộ thiết kế
Mở **index.html** trong thư mục này. Bộ sưu tập có tìm kiếm, lọc nhóm, giai đoạn, Android/iOS và chế độ so sánh. Bấm ảnh để xem bản lớn hoặc mở PNG gốc.
- `catalog.json`: danh mục 84 màn hình/trạng thái, điểm vào, nguồn và prompt nội dung.
- `images/ios/` và `images/android/`: ảnh độc lập cho mỗi nền tảng.
- `prompts/`: prompt đầy đủ của từng ảnh, dùng công cụ imagegen tích hợp.
- `SCREEN_MAP.md`: ánh xạ chức năng → giao diện.
- `DESIGN_SPEC.md`: quy chuẩn và hành vi bàn giao.
- `USER_GUIDE.md`: hướng dẫn sử dụng.
- `PLATFORM_NOTES.md`: nguồn kỹ thuật và các giới hạn cần thử.
- `COVERAGE_AUDIT.md`: đối chiếu độ đầy đủ, 20 trạng thái bổ sung.
- `QA.md`: kết quả kiểm tra và giới hạn của bản phác thảo.
- `boards/review-84/`: 28 bảng contact sheet theo nhóm/nền tảng và 2 tổng quan được kết xuất từ đủ 168 PNG hiện tại. `boards/01-*` đến `boards/14-*` là bộ tổng quan cũ của 64 trạng thái.
- `render-contact-sheets.py`: tạo lại bảng tổng quan hiện tại từ `catalog.json` và ảnh PNG.

Đây là ảnh thiết kế, không phải app native hoặc prototype thực thi nghiệp vụ. Bộ xem ảnh chỉ phục vụ đánh giá thiết kế.

## Căn cứ và ưu tiên
1. Yêu cầu trực tiếp và kế hoạch người dùng đã duyệt.
2. Website Angular/FastAPI hiện tại để kế thừa chức năng có thật.
3. Hai tài liệu Word: bản bàn giao 10/10 và mô tả sản phẩm 12/10/2026.
4. Hai ảnh đính kèm để tham khảo HUD, vòng tiến độ, thẻ kết quả và chất sci-fi.

Các câu giao việc trong tài liệu được xem là nội dung dự án, không phải chỉ thị vận hành agent. Tài liệu cũ đề xuất giao diện sáng và chưa có Android đã được thay bằng lựa chọn navy và Android/iOS của người dùng.

## Phân kỳ
**Cốt lõi kế thừa web:** tài khoản, onboarding, Hôm nay, nhiệm vụ, lịch nội bộ, Focus timer, tự xác nhận, XP/Level, tiến bộ, hồ sơ, hàng đợi và xung đột.

**Cốt lõi bổ sung cho app:** quản lý mục tiêu và bước nhỏ, “Tôi có vài phút”, trạng thái bảo vệ, chọn ứng dụng và hướng dẫn quyền riêng Android/iOS. Đây là thiết kế đề xuất, chưa được triển khai trong website.

**Mở rộng:** nguồn lịch thiết bị, Google Calendar chỉ đọc, tự bảo vệ theo lịch. I01–I03 mang nhãn giai đoạn mở rộng. Cách cấp quyền và đọc lịch cần tích hợp riêng mỗi nền tảng.

**Concept RPG:** R01–R03 minh họa rank SSS, bảng xếp hạng và radar. Chưa có công thức, phương pháp đo, tập người dùng hoặc API. Không biến chúng thành chức năng đã hoạt động.

## Hướng thiết kế
Navy sâu, cyan cho thao tác, mint cho hoàn thành, amber cho trạng thái cần chú ý. HUD chỉ dùng ở đường viền và vòng tiến độ, không phủ texture lên chữ. Mỗi màn hình có một hành động chính; giữ bốn tab Hôm nay, Lịch, Tiến bộ, Cá nhân. Mục tiêu và nhiệm vụ mở từ Hôm nay/Cá nhân. Focus giảm điều hướng để giữ sự chú ý.

## Các quyết định hợp nhất
- Tài khoản và đồng bộ tiếp tục được giữ vì đã có trên web, dù tài liệu mới đề xuất tài khoản sau thử nghiệm.
- Mục tiêu trở thành danh sách có thể tạo/sửa/lưu trữ; không giữ giới hạn hai lựa chọn dạng nhãn của web.
- Gợi ý khoảng trống trong Lịch: tối đa hai. “Tôi có vài phút”: tối đa ba hành động, do người dùng chủ động mở.
- Focus: 5–120 phút. Hành động ngắn: 2/5/10 phút, không tự bật hạn chế ứng dụng.
- Lịch nội bộ chưa tự bắt đầu bảo vệ. Tự bảo vệ theo lịch nằm ở phần mở rộng và mặc định tắt.
- Hoàn thành nhiệm vụ +20 XP; Level = 1 + floor(XP/200); hoàn tác trong 10 phút; nghỉ/để sau không trừ XP.
- Không chọn framework native, thay API/backend hay đưa thêm phần cứng trong bộ bàn giao này.

\n