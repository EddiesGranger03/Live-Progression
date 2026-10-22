# Quy chuẩn và hành vi giao diện

## Nhận diện
| Thành phần | Giá trị đích |
|---|---|
| Nền | #080F20 |
| Thẻ | #111E33 |
| Hành động chính | #55DCEF, chữ #080F20 |
| Chữ chính | #EFF6FF |
| Chữ phụ | #A4B4CD |
| Hoàn thành | Mint #66E5BB |
| Cảnh báo | Amber #F4C46B |
| Nguy hiểm | Coral #FF8792; luôn kèm nhãn |
| Font | Hệ thống iOS/Android hỗ trợ tiếng Việt; logo chữ riêng |
| Nhịp khoảng cách | 4, 8, 12, 16, 24, 32 |
| Thân bài | 16 pt/sp; nhãn phụ tối thiểu 13 pt/sp |
| Tiêu đề | 24–32 pt/sp |
| Vùng chạm đích | iOS ít nhất 44 × 44 pt; Android 48 × 48 dp |
| Thẻ/bảng trượt | Bo góc 16–24; HUD nhẹ ở thẻ nổi bật |

Đây là thông số đích cho triển khai. Ảnh raster không chứng minh kích thước vật lý, độ tương phản thực tế hoặc hỗ trợ trình đọc màn hình.

## Điều hướng
Bốn tab giữ vị trí ổn định. Hôm nay có đường tới nhiệm vụ, mục tiêu, hành động ngắn và Focus. Cá nhân chứa cấu hình, dữ liệu và nguồn lịch. Luồng sâu có nút quay lại. Bấm tab đang mở đưa về gốc tab.

Màn hình dài hoặc có nhiều trường dùng trang riêng. Sheet dành cho chọn thời gian, ngày, thao tác nhiệm vụ, chi tiết lịch và xem nhật ký. Alert chỉ yêu cầu xác nhận ngắn. Đóng một overlay rồi mới mở overlay tiếp theo; không lồng popup.

iOS: back chevron, sheet có tay nắm, tab bar và safe area dưới. Android: app bar, back hệ thống, lựa chọn dạng Material và thanh điều hướng gesture. Phần quyền phải dùng UI hệ thống thật khi triển khai; B02 là phần giải thích do app tạo.

## Dữ liệu minh họa thống nhất
Gia Long; ngày 15/10/2026; Asia/Ho_Chi_Minh. Tài khoản đang dùng: tổng 440 XP → Level 3 → 40/200 XP. Sau hoàn thành Ôn 5 từ đã học: +20 XP → 460 XP → Level 3 → 60/200 XP. Người mới: 0 XP → Level 1.

P01 là một snapshot lịch sử độc lập: 7 nhiệm vụ, +140 XP, 125 phút timer trong 09–15/10. P02 hiển thị một ngày có 2 nhiệm vụ, +40 XP, 25 phút timer. Không coi tất cả ảnh là cùng một thời điểm. S04 giữ 440 XP đã xác nhận và +20 XP dự kiến riêng.

## Hành vi chính
### Tài khoản và khởi đầu
Đăng ký → chọn mục tiêu/bước nhỏ → giờ hoạt động/nghỉ → lịch đầu tiên → Home. Bỏ qua quyền không chặn tạo nhiệm vụ hoặc timer. Bản trải nghiệm ghi rõ dữ liệu minh họa trên thiết bị. Email đặt lại chỉ hiện “đã gửi” sau phản hồi phù hợp; website chưa cấu hình SMTP phải báo đúng lỗi.

### Mục tiêu và nhiệm vụ
G03 và Q03 dùng chung bố cục cho tạo/sửa: khi tạo để trống trường, khi sửa điền dữ liệu; đổi tiêu đề và CTA tương ứng. Mục tiêu lưu trữ giữ lịch sử. Nhiệm vụ hoàn thành chỉ sửa tên/ghi chú, không đổi thời lượng hoặc XP gốc. Q06 dời ngày mở C04; lưu trữ dùng alert cùng cấu trúc G04 với tên nhiệm vụ và copy giữ lịch sử XP.

Q04 xác nhận mới cấp XP. Q05 là kết quả sau server chấp nhận; hoàn tác tối đa 10 phút. Hết thời hạn ẩn hành động và giữ lịch sử. Offline dùng S04 thay vì thông báo nhận XP chắc chắn. Retry không cấp XP lần hai.

### Hành động ngắn
M01 chọn thời gian và mục tiêu → M02 tối đa ba hành động chưa xong phù hợp thời lượng → M03 thực hiện → Q04/Q05 khi đã xong. Chưa xong/dừng giữ nhiệm vụ pending, không XP. Nghỉ đóng sheet hoặc quay về Home; không trừ điểm. Không có lựa chọn phù hợp: dùng bố cục rỗng S02, tiêu đề “Chưa có bước phù hợp”, CTA “Tạo bước nhỏ”, phụ “Đổi thời gian” / “Nghỉ”.

Đang có phiên hoặc hành động khác thì M04 yêu cầu quyết định trước; không tự tạo hai phiên. ActionAttempt và đồng bộ action là nhu cầu triển khai tương lai, không thêm API trong bộ ảnh.

### Lịch
C02 tạo/sửa bận, Focus hoặc nghỉ. Hai khoảng kề nhau không coi là trùng. C05 cho chỉnh hoặc vẫn lưu, không âm thầm đẩy giờ. C06 chỉ gợi ý trên dữ liệu lịch đủ; không suy ra cả ngày rảnh khi lịch trống. Nghỉ được loại khỏi gợi ý. C07 liên kết nhiệm vụ vào khung nội bộ. C08 xóa khung không xóa nhiệm vụ hoặc thay phiên đang chạy.

Đối với nguồn ngoài ở I02: chỉ đọc, nguồn hiện rõ, không cho sửa/xóa sự kiện gốc. Mất quyền hoặc cache cũ phải ghi thời điểm đồng bộ và dùng lịch nội bộ.

### Focus và bảo vệ
F01 → F02 → F03 → xác nhận kết quả. Không Pause. Hết giờ không cộng XP. F04 kết thúc sớm giữ nhiệm vụ pending. F02 “Chỉ có bộ đếm giờ” khi chưa có bằng chứng native đã áp dụng hạn chế. Sau kiểm chứng native thành công, thay badge bằng “Bảo vệ đang hoạt động” kèm số app đã chọn; không suy ra từ quyền được cấp.

B01 → B02 → quyền hệ thống → B03 → kiểm tra trạng thái → F01. Danh sách trống hoặc thiếu quyền dùng B05. iOS shield B04 chỉ có hành động đóng theo hướng tương thích; Android B04 là concept cần mẫu thử. Các màn này không mô phỏng cam kết khóa tuyệt đối. S06 kiểm tra lại trạng thái sau gián đoạn, không cấp XP.

### Tiến bộ và cài đặt
P01 chọn ngày kết thúc kỳ bảy ngày bằng picker C04; P02 là sheet nhật ký. P03 giải thích XP. U02 sửa tên, múi giờ, giờ hoạt động/nghỉ. U03 xin quyền khi bật lời nhắc. U04 quản lý quyền/dữ liệu. U05 nhắc thao tác chưa đồng bộ trước đăng xuất. U06 nhập XÓA, nút xóa chỉ bật khi khớp. Native cần cleanup bảo vệ và cache khi logout/xóa tài khoản.

### Trạng thái dùng chung
S01 skeleton, không gửi lặp. S02 rỗng với CTA tạo đầu tiên. S03 là lỗi theo trường giữ dữ liệu. Lỗi mạng/server dùng banner “Chưa lưu được. Thử lại” trong cùng bố cục, giữ bản nháp. S04 ngoại tuyến phân biệt XP dự kiến. S05 so sánh bản nháp với máy chủ; người dùng chọn thử lại hoặc bỏ. Thiếu quyền không chặn phần độc lập.

## Yêu cầu cho prototype/app ở bước sau
- Chiều rộng 360 px không cuộn ngang; với chữ lớn, thẻ và hàng chuyển sang xếp dọc.
- Form cuộn khi bàn phím mở, nút lưu tránh bàn phím; lỗi có liên kết tới trường.
- Tên accessibility cho icon; thứ tự đọc theo nội dung; trạng thái không chỉ khác màu.
- Tương phản chữ thường mục tiêu ≥4.5:1; kiểm tra trên UI thật. Reduce motion loại pulse/đếm vòng trang trí.
- Focus restore, xung đột hai thiết bị, XP idempotency, cleanup shield cần kiểm thử bằng mã và máy thật.


## Ảnh trạng thái bổ sung 16/10/2026

Ảnh riêng cho tạo mục tiêu G05, sửa nhiệm vụ Q07, lưu trữ nhiệm vụ Q08, trường bị khóa Q09, hoàn tác Q10 và hết hạn Q11. C09 minh họa sửa khung nghỉ; F05 là chọn thời lượng tùy chỉnh 5–120 phút. G06 chọn ưu tiên dạng boolean, không thêm công thức chấm điểm.

B06 biểu thị cấu hình sẵn sàng nhưng chưa bắt đầu phiên; F06 chỉ minh họa trạng thái native đã xác nhận trong phiên. Cả hai đều có nhãn cần thử thiết bị. A06 không xác nhận tài khoản tồn tại khi báo gửi email; A07 giữ form khi gửi lỗi. S07/S08 giữ ngữ cảnh tìm kiếm/chọn thời lượng. S09 giữ bản nháp khi lưu lỗi; S10 lưu thành công chưa làm nhiệm vụ hoàn thành và không cấp XP. U07 xác nhận tùy chọn cũ/mới. I04/I05 vẫn là mở rộng chưa triển khai.
