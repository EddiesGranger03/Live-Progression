# Đề xuất quyền tài khoản cho Solo Leveling

Trạng thái: **đề xuất thiết kế, chưa triển khai RBAC hay trang quản trị**. Hiện tại FastAPI xác thực tài khoản và kiểm tra chủ sở hữu dữ liệu; người dùng thao tác trên hồ sơ, lịch, nhiệm vụ, Focus và XP của chính mình. Kiểm thử đã có trường hợp chặn truy cập nhiệm vụ người khác.

## Đề xuất cho giai đoạn mở nhóm thử nghiệm

Thêm hai quyền `user` và `admin` khi đã xác định các thao tác quản trị cần thiết. Hiện tại website cá nhân chưa có nghiệp vụ quản trị, nên chưa cần thêm cột role hoặc dựng dashboard chỉ để có đủ tên vai trò.

| Quyền | Phạm vi đề xuất |
| --- | --- |
| `user` | Quản lý dữ liệu cá nhân: hồ sơ, nhiệm vụ, lịch, Focus, tiến bộ và tùy chọn tài khoản. Mọi tài khoản mới mặc định là user. |
| `admin` | Vận hành sản phẩm: xem số liệu tổng hợp, quản lý mẫu nhiệm vụ dùng chung nếu có, xử lý trạng thái tài khoản và sự cố theo quyền được xác định. Không mặc định được đọc lịch/ghi chú cá nhân, giả danh người khác hay sửa XP thủ công. |
| `manager` (giai đoạn sau) | Chỉ có ý nghĩa khi có nhóm, lớp học, huấn luyện viên hoặc giao nhiệm vụ. Quyền giới hạn trong nhóm mình quản lý và dữ liệu được chia sẻ; không xem toàn bộ người dùng. |

“Founder”, “Co-founder”, “BA”, “Developer” là trách nhiệm trong đội ngũ; chúng không tự cấp quyền admin trong ứng dụng. Nguyễn Vũ Gia Long và Nguyễn Khánh Sơn chỉ được cấp quyền vận hành theo công việc thực tế, không hardcode quyền từ tên hiển thị hoặc email viết trong mã nguồn.

## Yêu cầu khi triển khai

- Mặc định từ chối thao tác quản trị; kiểm tra quyền ở FastAPI trên từng request. Việc ẩn nút trong Angular chỉ phục vụ giao diện.
- Luôn giữ kiểm tra chủ sở hữu tài nguyên. Một trường `role` không thay thế điều kiện `user_id` trên nhiệm vụ, lịch và Focus.
- Đăng ký và cập nhật hồ sơ không được nhận trường cấp quyền từ client. Cấp/thu hồi admin qua công cụ vận hành được kiểm soát; không công bố mật khẩu admin mặc định trong repository.
- Chỉ thêm endpoint quản trị khi đã có mục đích và phạm vi dữ liệu rõ ràng; ghi nhật ký hành động quản trị, người thực hiện, đối tượng và thời điểm. Không ghi mật khẩu, cookie hoặc nội dung riêng tư không cần thiết vào log.
- Có migration nâng cấp database hiện tại; tài khoản cũ mặc định là user. Kiểm thử việc user gọi API admin, tự nâng quyền, truy cập dữ liệu người khác và thu hồi quyền.
- Khi có nhóm, thêm membership/quan hệ quản lý theo nhóm để quyết định quyền; tránh một role manager toàn hệ thống.

Các nguyên tắc quyền tối thiểu, mặc định từ chối và kiểm tra mỗi request dựa trên [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
