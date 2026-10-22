# Rà soát độ bao phủ ảnh giao diện

## Kết luận và trạng thái hiện tại

Bộ ban đầu có **64 màn hình/trạng thái × 2 nền tảng = 128 ảnh**. Bộ này đã có đại diện cho toàn bộ nhóm chức năng trong kế hoạch: tài khoản, khởi đầu, Hôm nay, mục tiêu, nhiệm vụ, hành động ngắn, lịch, Focus, bảo vệ, tiến bộ, cá nhân, trạng thái dữ liệu, tích hợp mở rộng và concept RPG.

Tuy nhiên, một số biến thể quan trọng mới được mô tả bằng quy tắc hoặc tái sử dụng bố cục, chưa có ảnh riêng. Vì vậy, diễn đạt chính xác là **đã đủ nhóm và luồng chính, còn thiếu ảnh riêng cho một số trạng thái chi tiết**. Số lượng 128 ảnh tự nó chưa chứng minh đã vẽ hết các biến thể.

Đợt bổ sung được lập trong `coverage-additions.json`: **20 trạng thái mới × 2 nền tảng = 40 ảnh**. Bộ bàn giao hiện có đủ **84 trạng thái, 168 ảnh**.

**Trạng thái hiện tại: đã tạo đủ 20 trạng thái bổ sung × 2 nền tảng.** Đã kiểm tra có 168/168 ảnh và prompt theo catalog, giải mã PNG bằng Pillow, tạo 30 bảng contact sheet mới, và so khớp ID nhúng trong gallery với catalog. Đã xem trực tiếp một số ảnh mới có rủi ro về luồng/nhãn. Tương tác gallery trong trình duyệt chưa được xác minh do Edge không khởi động được trong phiên này.

## Các trạng thái bổ sung

Mỗi dòng cần một ảnh Android và một ảnh iOS. “Màn hình” là trang riêng; “bảng trượt” là một sheet; “popup” là một hộp xác nhận ngắn. Mỗi ảnh chỉ thể hiện một overlay tại một thời điểm.

| Mã | Trạng thái | Điểm vào | Dạng | Lý do cần ảnh riêng | Tình trạng Android / iOS |
|---|---|---|---|---|---|
| A06 | Đã gửi hướng dẫn mật khẩu | A03 → Gửi hướng dẫn thành công | Màn hình | Cho thấy bước tiếp theo sau yêu cầu đặt lại mật khẩu; copy không xác nhận một tài khoản cụ thể có tồn tại. | Đã tạo / Đã tạo |
| A07 | Chưa gửi được email | A03 → Lỗi gửi | Màn hình | Phân biệt gửi thất bại với thành công; giữ email đã nhập và có đường thử lại. | Đã tạo / Đã tạo |
| G05 | Tạo mục tiêu mới | G01 → Thêm mục tiêu | Màn hình | G03 ban đầu thể hiện chỉnh sửa có dữ liệu; cần form trống và trạng thái CTA trước khi nhập tên. | Đã tạo / Đã tạo |
| G06 | Chọn ưu tiên mục tiêu | G02 → Ưu tiên | Bảng trượt | Làm rõ lựa chọn Ưu tiên/Bình thường và hành động áp dụng; không tạo công thức xếp hạng mới. | Đã tạo / Đã tạo |
| Q07 | Chỉnh sửa nhiệm vụ | Q02 → Chỉnh sửa | Màn hình | Q03 ban đầu thể hiện tạo mới; cần biến thể đã điền dữ liệu, nhãn và CTA lưu thay đổi. | Đã tạo / Đã tạo |
| Q08 | Xác nhận lưu trữ nhiệm vụ | Q06 → Lưu trữ | Popup | Trước đây chỉ tham chiếu cấu trúc G04; ảnh mới ghi đúng đối tượng nhiệm vụ và việc giữ lịch sử/XP. | Đã tạo / Đã tạo |
| Q09 | Sửa nhiệm vụ đã hoàn thành | Q02 đã hoàn thành → Sửa | Màn hình | Cho thấy tên/ghi chú còn sửa được, thời lượng và XP bị khóa; tránh hiểu nhầm sửa là cấp thêm XP. | Đã tạo / Đã tạo |
| Q10 | Đã hoàn tác hoàn thành | Q05 → Hoàn tác trong 10 phút | Màn hình | Minh họa nhiệm vụ trở lại chưa hoàn thành và XP trở về 440, Level 3, 40/200. | Đã tạo / Đã tạo |
| Q11 | Hết thời hạn hoàn tác | Q05 → Sau 10 phút | Bảng trượt | Thể hiện hành động hoàn tác đã biến mất, giữ kết quả 460 XP, Level 3, 60/200. | Đã tạo / Đã tạo |
| C09 | Chỉnh sửa khung nghỉ | C03 → Chỉnh sửa | Màn hình | Bổ sung cả trường hợp sửa khung và loại Nghỉ; Focus tắt và không bật được cho khung nghỉ. | Đã tạo / Đã tạo |
| F05 | Chọn thời lượng tùy chỉnh | F01 → Tùy chỉnh | Bảng trượt | Làm rõ chọn 35 phút trong giới hạn Focus 5–120 phút và cách chọn khác nhau của hai nền tảng. | Đã tạo / Đã tạo |
| F06 | Focus có bảo vệ — minh họa có điều kiện | F01 → Sau kiểm chứng native thành công | Màn hình | Phân biệt phiên có bảo vệ được native xác nhận với F02 chỉ có timer; ảnh phải ghi nhãn minh họa cần thử thiết bị. | Đã tạo / Đã tạo |
| B06 | Bảo vệ sẵn sàng — minh họa có điều kiện | B01 → Sau kiểm chứng quyền và cấu hình | Màn hình | Phân biệt “sẵn sàng” với “đang bảo vệ”; chưa bắt đầu phiên thì không báo đang hạn chế ứng dụng. | Đã tạo / Đã tạo |
| S07 | Tìm kiếm không có kết quả | Q01 → Tìm kiếm | Màn hình | Giữ từ khóa/bộ lọc và chỉ ra cách phục hồi; khác với chưa từng tạo nhiệm vụ ở S02. | Đã tạo / Đã tạo |
| S08 | Chưa có hành động ngắn phù hợp | M01 → Không có bước phù hợp | Màn hình | Giữ lựa chọn 2 phút, cho tạo bước nhỏ/đổi thời gian/nghỉ; không áp mức tối thiểu 5 phút của Focus. | Đã tạo / Đã tạo |
| S09 | Lưu thất bại và giữ bản nháp | C02 → Lỗi máy chủ | Màn hình | Phân biệt lỗi lưu với lỗi nhập S03; giữ nguyên form hợp lệ và có hành động thử lại. | Đã tạo / Đã tạo |
| S10 | Đã lưu thay đổi | Q07 → Lưu thành công | Màn hình | Minh họa toast không chặn thao tác; nhiệm vụ vẫn chưa hoàn thành và không tăng XP. | Đã tạo / Đã tạo |
| U07 | Xác nhận thay đổi tùy chọn | U02 → Lưu thay đổi giờ hoạt động | Popup | Cho thấy giá trị cũ/mới và quyết định lưu; không ngụ ý tự dời toàn bộ lịch. | Đã tạo / Đã tạo |
| I04 | Quyền lịch thiết bị bị từ chối | I01 → Từ chối hoặc thu hồi quyền | Màn hình | Giữ đường dùng lịch nội bộ khi thiếu quyền; ghi rõ tích hợp mở rộng chưa triển khai. | Đã tạo / Đã tạo |
| I05 | Lịch ngoài chưa cập nhật | I01 → Đồng bộ lỗi hoặc cache cũ | Màn hình | Hiển thị nguồn, thời điểm cập nhật và cảnh báo dữ liệu cũ; không dùng cache để khẳng định người dùng rảnh. | Đã tạo / Đã tạo |

## Những trường hợp tiếp tục dùng đặc tả thành phần

Không cần tạo ảnh cho mọi tổ hợp dữ liệu và lỗi để chứng minh cùng một hành vi. Các trường hợp sau tiếp tục được quản lý bằng quy chuẩn thành phần và quy tắc trong `DESIGN_SPEC.md`:

- Trường bắt buộc, email sai định dạng, mật khẩu chưa đạt yêu cầu: dùng cùng cấu trúc nhãn/lỗi theo trường; giữ dữ liệu đã nhập và đưa tiêu điểm về trường lỗi.
- Skeleton, spinner và trạng thái đang gửi: dùng thành phần tải chung, chặn gửi lặp trong thời gian xử lý.
- Form tạo/sửa với nội dung khác nhau: giữ cấu trúc, thay tiêu đề, dữ liệu và CTA; các ảnh riêng bổ sung chỉ minh họa khác biệt có ý nghĩa.
- Thông báo lưu thành công, thao tác thất bại hoặc đã hoàn tác: dùng toast/banner phù hợp với mức độ và thời gian tồn tại; không mở thêm popup chỉ để báo một kết quả đơn giản.
- Chọn ngày và kỳ tiến bộ: tái sử dụng picker; kỳ tiến bộ vẫn dài bảy ngày theo đặc tả.
- Lựa chọn ngắn như ngày, mục tiêu hoặc tùy chọn: dùng thành phần sheet/picker chung, luôn có đường hủy; không lồng nhiều overlay.
- Tên nhiệm vụ dài, nhiều kết quả, danh sách rỗng theo bộ lọc và nhiều thao tác chờ: quy định cuộn, xuống dòng và CTA theo ngữ cảnh thay vì nhân vô hạn số ảnh.
- Cảnh báo mất quyền hoặc lỗi mạng ở nhiều điểm vào: dùng trạng thái chung, giữ phần chức năng độc lập sử dụng được và nêu rõ đường khôi phục.

Ảnh riêng dùng để làm rõ quyết định của người dùng, thay đổi dữ liệu hoặc trạng thái quan trọng. Đặc tả thành phần quyết định cách áp dụng cùng quy tắc vào các ngữ cảnh còn lại.

## Giới hạn của các ảnh liên quan hệ điều hành

B02 là phần giải thích do app tạo. Quyền, trình chọn ứng dụng và màn hình hạn chế liên quan Android/iOS phụ thuộc API, phiên bản hệ điều hành, cơ chế triển khai và quyền phân phối. Ảnh concept không phải bản sao được xác minh của mọi màn hình hệ thống và không thể thay thế giao diện hệ thống thật.

B04, B06 và F06 cần nhãn minh họa native/cần thử thiết bị. “Có quyền”, “sẵn sàng” và “đang bảo vệ” là ba trạng thái khác nhau. Chỉ thể hiện đang bảo vệ sau khi cơ chế native xác nhận đã áp dụng hạn chế; quyền truy cập dữ liệu sử dụng đơn thuần không chứng minh Android đã chặn ứng dụng. Không hứa khóa tuyệt đối hay hoạt động nền vô điều kiện.

I04/I05 thuộc phần mở rộng chưa triển khai. Lịch bên ngoài chỉ đọc theo chức năng đã duyệt; ảnh không xác nhận quy trình cấp quyền, tài khoản hoặc đồng bộ thực tế đã chạy được.

## Bằng chứng kiểm tra và phần cần làm ở bước app

`verification.json` ghi nhận 84 trạng thái, 168 ảnh và prompt tương ứng, không thiếu tệp, ID trong HTML gallery trùng catalog. Pillow đã giải mã các PNG để tạo 28 contact sheet theo nhóm/nền tảng và hai bảng tổng quan chính tại `boards/review-84/`. Đã xem trực tiếp mẫu ảnh Q09 iOS, F05 iOS, F06 Android, I05 iOS, I04 Android, S08 Android và U07 iOS.

Không hoàn tất được kiểm tra tương tác hoặc chụp gallery bằng Edge: tiến trình trình duyệt bị đóng khi khởi động trong môi trường hiện tại. Các bảng 01–14 trong `boards/` thuộc bộ 64 trạng thái cũ; dùng `boards/review-84/` cho catalog hiện tại. Kiểm tra ảnh và gallery là bằng chứng cho bộ bàn giao thiết kế. Chúng chưa chứng minh app mobile đã hoạt động, bảo vệ native đã hạn chế ứng dụng, đồng bộ/XP chạy đúng hoặc điều hướng tác vụ đã được kiểm thử trên thiết bị.

Các yêu cầu tránh bàn phím che nút, form cuộn, cỡ chữ lớn, vùng chạm, tương phản và trình đọc màn hình hiện là **thông số thiết kế đích**. Bộ ảnh raster chưa cung cấp bằng chứng thực nghiệm cho bàn phím hoặc cỡ chữ lớn. Những nội dung đó cần được kiểm tra trên prototype/app thực tế của cả Android và iOS.
