# Hướng dẫn sử dụng sơ bộ — Solo Leveling
Ứng dụng hiện dùng giao diện Angular trong vỏ Capacitor. Các luồng tài khoản, mục tiêu độc lập, nhiệm vụ, lịch, Focus, tiến bộ và cá nhân kết nối backend hiện có. Android có thêm lời nhắc mạng xã hội tùy chọn; iOS chưa có Screen Time entitlement/extension nên chỉ dùng được timer Focus.

## 1. Bắt đầu hành trình
1. Mở app, chọn **Tạo tài khoản**; nhập tên, email và mật khẩu. Nếu chỉ muốn xem trước, chọn **Mở bản trải nghiệm**.
2. Đặt mục tiêu cụ thể như “Học tiếng Anh”, thêm bước “Ôn 5 từ đã học”.
3. Chọn giờ hoạt động và giờ nghỉ. Thêm khung lịch đầu tiên hoặc chọn **Để sau**.
4. Vào **Hôm nay**. Cấp quyền là tùy chọn; chưa cấp vẫn dùng nhiệm vụ và timer được.
Ảnh: A01–A05, O01–O04.

## 2. Tạo mục tiêu và nhiệm vụ
1. Từ **Hôm nay** hoặc danh sách nhiệm vụ, mở **Mục tiêu** rồi chọn **Tạo mục tiêu**.
2. Đặt tên đích đến và mô tả lý do hoặc kết quả mong muốn. Có thể sửa nội dung sau.
3. Mở mục tiêu, chọn **Chọn ưu tiên** để đưa nó lên đầu danh sách; nhãn này chỉ điều khiển cách sắp xếp, không phải điểm hay xếp hạng.
4. Chọn **Thêm nhiệm vụ cho mục tiêu** để tạo một bước hành động liên kết. Trường **Lĩnh vực** như Học tập/Sức khỏe vẫn riêng với trường **Mục tiêu liên kết**.
5. Mở nhiệm vụ để bắt đầu Focus, đặt vào lịch hoặc để sau. Từ màn hình mục tiêu có thể theo dõi các nhiệm vụ đã làm và còn lại.
6. Lưu trữ mục tiêu sẽ ẩn mục tiêu khỏi danh sách đang thực hiện nhưng giữ nguyên các nhiệm vụ, lịch và XP đã ghi. Mục tiêu có thể khôi phục trong tab **Đã lưu trữ**.
7. Nhiệm vụ hoàn thành chỉ sửa được tên và ghi chú; lưu trữ nhiệm vụ giữ kết quả cũ.
Ảnh thiết kế G01–G06 hiện có luồng mục tiêu vận hành tương ứng. Lĩnh vực trên hồ sơ vẫn là bộ phân loại cũ; mục tiêu riêng và liên kết `goalId` được lưu độc lập.

## 3. Dành thời gian trong lịch
1. Mở tab **Lịch**, chọn ngày.
2. Chọn **Thêm khung giờ**, nhập tên, giờ bắt đầu/kết thúc.
3. Chọn bận hoặc nghỉ; bật Focus cho khung cần tập trung.
4. Nếu báo trùng, chọn **Chỉnh lại** hoặc chủ động **Vẫn lưu**.
5. Chạm một khung để xem, sửa hoặc xóa. Muốn xếp nhiệm vụ có sẵn, mở nhiệm vụ → **Đặt vào lịch**.
6. Khoảng được gợi ý có thể dùng để làm nhiệm vụ hoặc nghỉ; không bắt buộc lấp kín lịch.
Ảnh: C01–C08.

## 4. Bắt đầu Focus
1. Từ Hôm nay, nhiệm vụ hoặc khung lịch, chọn **Bắt đầu Focus**.
2. Chọn thời lượng 5–120 phút; xem trạng thái bảo vệ.
3. Nếu chưa thiết lập quyền nhắc mạng xã hội, app ghi **Chỉ có bộ đếm giờ**. Mở **Thiết lập bảo vệ** nếu muốn bật phần native Android.
4. Bấm **Bắt đầu**. Có thể về Hôm nay rồi bấm **Tiếp tục Focus**.
5. Cần dừng thì chọn **Kết thúc sớm** và xác nhận. Nhiệm vụ chưa bị đánh dấu hoàn thành.
6. Hết giờ, trả lời đã làm xong hay chưa. Timer hết không tự cấp XP.
Ảnh: H02, F01–F04.

## 5. Bật lời nhắc hoặc che app tự nguyện trong Focus (Android)
1. Mở **Cá nhân → Bảo vệ Focus**.
2. Chọn app được hỗ trợ đang cài (TikTok, Instagram, Facebook). App học tập và các app không chọn không bị che; cấu hình chỉ lưu trên thiết bị.
3. Bật **Nhắc khi mở mạng xã hội** nếu muốn notification. Cấp quyền **Truy cập dữ liệu sử dụng** và quyền thông báo trong Cài đặt Android. Khi Focus chạy, Android chỉ gửi lời nhắc cho app đã chọn và lời nhắc nghỉ theo thời gian bạn đặt.
4. Nếu muốn che app, bật **Che app đã chọn trong Focus**, đọc phần giải thích riêng, đánh dấu đồng ý rồi mở Cài đặt → Trợ năng → Solo Leveling. Bật dịch vụ để Android cho phép nhận sự kiện tên package của app đã chọn.
5. Khi che hoạt động, lời nhắc phủ app hiển thị tên việc đang Focus và có ba lựa chọn: mở Solo Leveling, tạm cho phép app hiện tại 10 phút, hoặc tắt che tới hết phiên Focus. Dừng/kết thúc Focus cũng dừng che.
6. Quyền Trợ năng chỉ nhận diện tên package của ứng dụng đã chọn trong Focus; app không đọc chữ, ảnh, cây giao diện, âm thanh hoặc nội dung gõ và không gửi sự kiện này lên backend. Không dùng `isAccessibilityTool` vì đây không phải công cụ hỗ trợ người khuyết tật.
7. Ứng dụng Điện thoại và Tin nhắn riêng không có trong danh sách. Android không thể phân biệt cuộc gọi/tin nhắn bên trong TikTok, Instagram hoặc Facebook; trong trường hợp đó dùng lựa chọn tạm cho phép hoặc tắt che cho phiên.
8. Nếu từ chối/thu hồi một quyền, timer Focus vẫn dùng được; tính năng phụ thuộc quyền đó sẽ không hoạt động. Bạn có thể tắt che bất cứ lúc nào. Trước phát hành Google Play cần khai báo AccessibilityService, hoàn tất biểu mẫu review, điền Data safety và mô tả quyền này trong listing.
9. iOS: timer vẫn dùng được; che app chưa khả dụng cho tới khi có Family Controls entitlement được Apple duyệt, extension và provisioning phù hợp. Việc build/test iOS cũng cần macOS/Xcode.
10. Bản web không thể theo dõi hoặc che app khác. App được chọn và trạng thái đồng ý lưu cục bộ trên thiết bị, không gửi về backend.

## 6. Khi chỉ có vài phút
1. Từ Hôm nay chọn **Tôi có vài phút**.
2. Chọn 2, 5 hoặc 10 phút và mục tiêu.
3. Chọn một trong tối đa ba hành động phù hợp.
4. Thực hiện rồi chọn **Tôi đã làm xong**, **Chưa xong** hoặc **Dừng**.
5. Nếu muốn nghỉ, chọn **Dành để nghỉ**. Nghỉ hoặc bỏ qua không bị trừ XP.
6. Nếu đang có phiên, quyết định tiếp tục hoặc kết thúc phiên cũ trước khi đổi việc. Phiên ngắn được lưu để đồng bộ nhưng không tự hoàn thành nhiệm vụ và không cấp XP.
Ảnh: M01–M04. Hành động ngắn không tự hạn chế app.

## 7. Xác nhận kết quả và xem tiến bộ
1. Sau khi thực sự hoàn thành, chọn **Tôi đã làm xong** và xác nhận.
2. Mỗi nhiệm vụ được chấp nhận nhận **20 XP** một lần. Nếu bấm nhầm, chọn **Hoàn tác** trong 10 phút.
3. Mở **Tiến bộ** để xem nhiệm vụ, XP và phút timer của bảy ngày.
4. Chạm một ngày để xem nhật ký.
5. Mỗi 200 XP tăng một Level. Phút timer là thời gian phiên, không phải đo lường mức chú ý đã xác minh.
Ảnh: Q04–Q05, P01–P03.

## 8. Quyền, thông báo và sự cố
- **Không có mạng:** xem nhãn ngoại tuyến; thao tác mới chờ đồng bộ. XP dự kiến chưa phải XP đã được server xác nhận.
- **Có xung đột:** vào Đồng bộ, so sánh bản nháp và dữ liệu máy chủ; chọn xem lại/thử lại hoặc bỏ thao tác.
- **Nhập sai giờ:** chỉnh trường được báo lỗi; dữ liệu còn lại vẫn giữ.
- **Phiên gián đoạn:** xem thông báo, kiểm tra lại bảo vệ trước khi bắt đầu phiên mới.
- **Muốn ít nhắc hơn:** Cá nhân → Thông báo; tắt loại lời nhắc không cần và đặt giờ yên lặng.
- **Đăng xuất/xóa:** xử lý dữ liệu chờ đồng bộ trước. Xóa tài khoản cần nhập XÓA và không thể hoàn tác.
Ảnh: U01–U06, S01–S06.

## 9. Phần chưa thuộc chức năng vận hành hiện tại
I01–I03: lịch thiết bị, Google Calendar và tự bảo vệ theo lịch là thiết kế mở rộng.
R01–R03: rank SSS, bảng xếp hạng và radar chỉ là concept. Chưa có công thức chấm điểm năng lực hay xếp hạng thực.

Restriction iOS chưa được triển khai. Android đã có lời nhắc qua foreground service và màn che tự nguyện qua AccessibilityService. Hai quyền được tách riêng; bật một quyền không tự bật quyền kia. Trước khi phát hành, Google Play cần review AccessibilityService và khai báo loại foreground service. Việc build Android không chứng minh store approval. Trên emulator đã xác nhận build/cài/chạy và giao diện; chưa cài social apps/chưa bật quyền để kiểm tra overlay hoặc notification end-to-end.


## Ảnh tình huống chi tiết bổ sung

- Tạo mục tiêu trống: G05; chọn ưu tiên: G06. Sửa nhiệm vụ: Q07; lưu trữ: Q08.
- Nhiệm vụ đã hoàn thành chỉ sửa tên/ghi chú: Q09. Bấm hoàn tác trong hạn: Q10; hết 10 phút: Q11.
- Đặt thời lượng Focus tùy chỉnh: F05. Cấu hình bảo vệ sẵn sàng: B06; phiên có xác nhận native: F06 (minh họa cần thử thiết bị).
- Không tìm được nhiệm vụ: S07; không có hành động ngắn phù hợp: S08. Lỗi lưu giữ bản nháp: S09; lưu thành công: S10.
- Gửi hướng dẫn mật khẩu: A06/A07. Sửa khung nghỉ: C09. Xác nhận giờ hoạt động: U07. Lịch ngoài thiếu quyền/cũ: I04/I05.
