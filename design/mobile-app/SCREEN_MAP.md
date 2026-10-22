# Bản đồ chức năng → giao diện

84 màn hình/trạng thái, mỗi mục có ảnh iOS và Android: 168 ảnh. Bản đồ được cập nhật 16/10/2026; ảnh được rà soát 21/10/2026. Xem COVERAGE_AUDIT.md để đối chiếu lần bổ sung.

| ID | Nhóm | Giao diện | Dạng | Điểm vào | Giai đoạn | Nguồn |
|---|---|---|---|---|---|---|
| A01 | Tài khoản | Đăng nhập | screen | Mở app | Cốt lõi | Website hiện tại |
| A02 | Tài khoản | Tạo tài khoản | screen | A01 | Cốt lõi | Website hiện tại |
| A03 | Tài khoản | Quên mật khẩu | screen | A01 | Cốt lõi | Website hiện tại |
| A04 | Tài khoản | Đặt lại mật khẩu | screen | Email | Cốt lõi | Website hiện tại |
| A05 | Tài khoản | Bản trải nghiệm | sheet | A01 | Cốt lõi | Website hiện tại |
| A06 | Tài khoản | Đã gửi hướng dẫn mật khẩu | screen | A03 → Gửi hướng dẫn thành công | Cốt lõi | Website hiện tại |
| A07 | Tài khoản | Chưa gửi được email | screen | A03 → Lỗi gửi | Cốt lõi | Website hiện tại |
| O01 | Khởi đầu | Giới thiệu | screen | A02 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| O02 | Khởi đầu | Mục tiêu và bước đầu | screen | O01 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| O03 | Khởi đầu | Giờ hoạt động và nghỉ | screen | O02 | Cốt lõi | Website hiện tại |
| O04 | Khởi đầu | Lịch đầu tiên và quyền | screen | O03 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| H01 | Hôm nay | Hôm nay | screen | Tab Hôm nay | Cốt lõi | Website hiện tại |
| H02 | Hôm nay | Có phiên đang chạy | screen | F02 → Home | Cốt lõi | Website hiện tại |
| H03 | Hôm nay | Thao tác nhanh | sheet | Nút thêm | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G01 | Mục tiêu | Danh sách mục tiêu | screen | Home → Mục tiêu | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G02 | Mục tiêu | Chi tiết mục tiêu | screen | G01 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G03 | Mục tiêu | Chỉnh sửa mục tiêu | screen | G01 / G02 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G04 | Mục tiêu | Lưu trữ mục tiêu | dialog | G02 menu | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G05 | Mục tiêu | Tạo mục tiêu mới | screen | G01 → Thêm mục tiêu | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| G06 | Mục tiêu | Chọn ưu tiên mục tiêu | sheet | G02 → Ưu tiên | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| Q01 | Nhiệm vụ | Danh sách và lọc | screen | Home Xem tất cả | Cốt lõi | Website hiện tại |
| Q02 | Nhiệm vụ | Chi tiết nhiệm vụ | screen | Q01 | Cốt lõi | Website hiện tại |
| Q03 | Nhiệm vụ | Tạo nhiệm vụ | screen | H03 / Q02 | Cốt lõi | Website hiện tại |
| Q04 | Nhiệm vụ | Hoàn thành và nhận XP | dialog | Q02 hoàn thành | Cốt lõi | Website hiện tại |
| Q05 | Nhiệm vụ | Kết quả và hoàn tác | sheet | Q04 xác nhận | Cốt lõi | Website hiện tại |
| Q06 | Nhiệm vụ | Menu nhiệm vụ | sheet | Q01 menu | Cốt lõi | Website hiện tại |
| Q07 | Nhiệm vụ | Chỉnh sửa nhiệm vụ | screen | Q02 → Chỉnh sửa | Cốt lõi | Website hiện tại |
| Q08 | Nhiệm vụ | Xác nhận lưu trữ nhiệm vụ | dialog | Q06 → Lưu trữ | Cốt lõi | Website hiện tại |
| Q09 | Nhiệm vụ | Sửa nhiệm vụ đã hoàn thành | screen | Q02 đã hoàn thành → Sửa | Cốt lõi | Website hiện tại |
| Q10 | Nhiệm vụ | Đã hoàn tác hoàn thành | screen | Q05 → Hoàn tác trong 10 phút | Cốt lõi | Website hiện tại |
| Q11 | Nhiệm vụ | Hết thời hạn hoàn tác | sheet | Q05 → Sau 10 phút | Cốt lõi | Website hiện tại |
| M01 | Vài phút | Chọn thời gian và mục tiêu | sheet | Home shortcut | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| M02 | Vài phút | Gợi ý hành động ngắn | screen | M01 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| M03 | Vài phút | Đang làm hành động ngắn | screen | M02 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| M04 | Vài phút | Đổi việc hoặc nghỉ | dialog | M02 khi có phiên | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| C01 | Lịch | Timeline ngày | screen | Tab Lịch | Cốt lõi | Website hiện tại |
| C02 | Lịch | Tạo khung giờ | screen | C01 thêm | Cốt lõi | Website hiện tại |
| C03 | Lịch | Chi tiết khung giờ | sheet | C01 chạm khung | Cốt lõi | Website hiện tại |
| C04 | Lịch | Chọn ngày | sheet | C01 ngày | Cốt lõi | Website hiện tại |
| C05 | Lịch | Cảnh báo trùng lịch | dialog | C02 lưu | Cốt lõi | Website hiện tại |
| C06 | Lịch | Gợi ý hoặc nghỉ | sheet | C01 khoảng trống | Cốt lõi | Website hiện tại |
| C07 | Lịch | Đặt nhiệm vụ vào lịch | sheet | Q02 Đặt lịch | Cốt lõi | Website hiện tại |
| C08 | Lịch | Xóa khung giờ | dialog | C03 xóa | Cốt lõi | Website hiện tại |
| C09 | Lịch | Chỉnh sửa khung nghỉ | screen | C03 → Chỉnh sửa | Cốt lõi | Website hiện tại |
| F01 | Focus | Thiết lập phiên | screen | Q02 / Home | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| F02 | Focus | Phiên đang chạy | screen | F01 | Cốt lõi | Website hiện tại |
| F03 | Focus | Hết giờ và tự xác nhận | screen | F02 hết giờ | Cốt lõi | Website hiện tại |
| F04 | Focus | Kết thúc sớm | dialog | F02 kết thúc | Cốt lõi | Website hiện tại |
| F05 | Focus | Chọn thời lượng tùy chỉnh | sheet | F01 → Tùy chỉnh | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| F06 | Focus | Focus có bảo vệ — minh họa có điều kiện | screen | F01 → Sau kiểm chứng native thành công | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B01 | Bảo vệ | Trạng thái quyền | screen | F01 / Cá nhân | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B02 | Bảo vệ | Giải thích và cấp quyền | screen | B01 | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B03 | Bảo vệ | Chọn ứng dụng | screen | B01 | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B04 | Bảo vệ | Màn hình ngắt hành vi | screen | Mở ứng dụng hạn chế | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B05 | Bảo vệ | Thiếu hoặc thu hồi quyền | dialog | B01 / F01 | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| B06 | Bảo vệ | Bảo vệ sẵn sàng — minh họa có điều kiện | screen | B01 → Sau kiểm chứng quyền và cấu hình | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| P01 | Tiến bộ | Tổng quan 7 ngày | screen | Tab Tiến bộ | Cốt lõi | Website hiện tại |
| P02 | Tiến bộ | Nhật ký ngày | sheet | P01 biểu đồ | Cốt lõi | Website hiện tại |
| P03 | Tiến bộ | Giải thích XP và Level | sheet | P01 XP | Cốt lõi | Website hiện tại |
| U01 | Cá nhân | Hồ sơ và điều hướng cài đặt | screen | Tab Cá nhân | Cốt lõi | Website hiện tại |
| U02 | Cá nhân | Chỉnh hồ sơ và giờ nghỉ | screen | U01 | Cốt lõi | Website hiện tại |
| U03 | Cá nhân | Thông báo | screen | U01 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| U04 | Cá nhân | Quyền và dữ liệu | screen | U01 | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| U05 | Cá nhân | Đăng xuất | dialog | U01 | Cốt lõi | Website hiện tại |
| U06 | Cá nhân | Xóa tài khoản | dialog | U04 | Cốt lõi | Website hiện tại |
| U07 | Cá nhân | Xác nhận thay đổi tùy chọn | dialog | U02 → Lưu thay đổi giờ hoạt động | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| S01 | Trạng thái | Đang tải | screen | Mở Home | Cốt lõi | Website hiện tại |
| S02 | Trạng thái | Chưa có dữ liệu | screen | Home mới | Cốt lõi | Website hiện tại |
| S03 | Trạng thái | Lỗi và giữ bản nháp | screen | C02 lỗi lưu | Cốt lõi | Website hiện tại |
| S04 | Trạng thái | Offline và XP dự kiến | screen | Home mất mạng | Cốt lõi | Website hiện tại |
| S05 | Trạng thái | Hàng đợi và xung đột | screen | U01 Đồng bộ | Cốt lõi | Website hiện tại |
| S06 | Trạng thái | Phiên gián đoạn | screen | Khôi phục phiên | Cốt lõi | Yêu cầu native + tài liệu nền tảng |
| S07 | Trạng thái | Tìm kiếm không có kết quả | screen | Q01 → Tìm kiếm | Cốt lõi | Website hiện tại |
| S08 | Trạng thái | Chưa có hành động ngắn phù hợp | screen | M01 → Không có bước phù hợp | Cốt lõi | Mô tả sản phẩm + hợp nhất đã duyệt |
| S09 | Trạng thái | Lưu thất bại và giữ bản nháp | screen | C02 → Lỗi máy chủ | Cốt lõi | Website hiện tại |
| S10 | Trạng thái | Đã lưu thay đổi | screen | Q07 → Lưu thành công | Cốt lõi | Website hiện tại |
| I01 | Mở rộng | Nguồn lịch | screen | U01 Nguồn lịch | Mở rộng | Tích hợp mở rộng đã duyệt |
| I02 | Mở rộng | Kết nối lịch chỉ đọc | screen | I01 | Mở rộng | Tích hợp mở rộng đã duyệt |
| I03 | Mở rộng | Tự bảo vệ theo lịch | screen | I01 / B01 | Mở rộng | Tích hợp mở rộng đã duyệt |
| I04 | Mở rộng | Quyền lịch thiết bị bị từ chối | screen | I01 → Từ chối hoặc thu hồi quyền | Mở rộng | Tích hợp mở rộng đã duyệt |
| I05 | Mở rộng | Lịch ngoài chưa cập nhật | screen | I01 → Đồng bộ lỗi hoặc cache cũ | Mở rộng | Tích hợp mở rộng đã duyệt |
| R01 | RPG tương lai | Rank | screen | P01 concept | Concept RPG | Ảnh tham chiếu + concept tương lai |
| R02 | RPG tương lai | Bảng xếp hạng | screen | R01 | Concept RPG | Ảnh tham chiếu + concept tương lai |
| R03 | RPG tương lai | Radar năng lực | screen | R01 | Concept RPG | Ảnh tham chiếu + concept tương lai |

## Biến thể và thành phần dùng chung
- Tạo/sửa đã có cặp ảnh riêng: G05/G03, Q03/Q07, C02/C09. C09 minh họa sửa khung nghỉ; sửa khung bận dùng cùng form C02 có dữ liệu và CTA Lưu thay đổi.
- Chọn ưu tiên G06; lưu trữ mục tiêu G04 và nhiệm vụ Q08 có ảnh riêng.
- Nhiệm vụ hoàn thành khóa trường tại Q09; hoàn tác thành công Q10; hết hạn hoàn tác Q11.
- Chọn thời lượng Focus F05; F02 chỉ có timer, F06 minh họa sau xác nhận native; B06 sẵn sàng trước phiên, chưa phải đang bảo vệ.
- Chọn ngày nhiệm vụ và kỳ tiến bộ dùng picker C04; kỳ P01 luôn dài bảy ngày.
- Tìm kiếm không khớp S07; không có hành động ngắn phù hợp S08; trạng thái chưa từng có dữ liệu S02.
- Gửi email thành công A06 và thất bại A07; lỗi theo trường S03; lỗi lưu giữ bản nháp S09; toast lưu thành công S10.
- Xác nhận tùy chọn U07; thiếu quyền bảo vệ B05; lịch ngoài thiếu quyền I04 hoặc cũ I05.
- Những lỗi nhập khác dùng cùng cấu trúc trường/lỗi. Popup dùng một lớp; đóng overlay hiện tại trước khi mở overlay khác.

## Luồng bàn giao
A01 → A02 → O01 → O02 → O03 → O04 → H01. A03 → A06/A07 → A04.
H01 → G01 → G05/G03 → G02 → G06/G04.
H01 → Q01 → Q03/Q07 → Q02 → F01 → F05 → F02/F06 → F03 → Q04 → Q05 → Q10/Q11.
Q02 hoàn thành → Q09. Q06 → Q08. Tìm kiếm không khớp → S07.
H01 → M01 → M02/M03 hoặc S08 → Q04/Q05 khi đã hoàn thành.
C01 → C02 → C05 hoặc C03 → C09/C08. Q02 → C07 → C01. Lỗi lưu → S09.
U01 → B01 → B02 → B03 → B06; thiếu quyền → B05. B06/F06 chỉ là minh họa có điều kiện.
U01 → U02 → U07; U01 → S05. Offline → S04; gián đoạn → S06.
U01 → I01 → I02/I03/I04/I05 (mở rộng). P01 → R01 → R02/R03 (concept riêng).
