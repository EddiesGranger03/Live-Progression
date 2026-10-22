# Kiểm tra bộ phác thảo Solo Leveling

Ngày rà soát: 21/10/2026. Phạm vi: ảnh concept, đặc tả, bảng tổng quan và thư viện xem ảnh tại máy.

## Kết quả

- Catalog có 84 màn hình/trạng thái. Mỗi trạng thái có một ảnh PNG và một prompt riêng cho Android và iOS: 168 ảnh, 168 prompt.
- Kiểm tra tĩnh xác nhận đủ tệp, kích thước PNG dọc hợp lệ và ID nhúng trong `index.html` khớp với `catalog.json`; kết quả chi tiết ở `verification.json` và `asset-check.json`.
- Pillow đã mở/giải mã ảnh nguồn và tạo 28 bảng theo nhóm/nền tảng cùng hai bảng tổng quan chính trong `boards/review-84/`. Manifest ghi nguồn, nền tảng và số trạng thái.
- Đã xem trực tiếp ảnh bổ sung Q09 iOS, F05 iOS, F06 Android, I05 iOS, I04 Android, S08 Android và U07 iOS; chữ, luồng và giới hạn nền tảng nhìn chung phù hợp đặc tả.
- Chưa xác minh thao tác tìm kiếm/lọc, mở ảnh, bàn phím, Escape hoặc tràn layout trong trình duyệt. Edge đóng khi khởi động trong môi trường này. Các ảnh `boards/01-*` đến `boards/14-*` là bảng cũ của catalog 64 trạng thái; dùng thư mục `boards/review-84/` cho bản hiện tại.

## Những điểm được giữ nhất quán

- Dữ liệu mẫu: người dùng mới Level 1 / 0 XP; tài khoản minh họa Level 3 / 440 XP / 40 trên 200 XP.
- Hoàn thành nhiệm vụ nhận 20 XP; tổng kết sau hoàn thành là 460 XP / Level 3 / 60 trên 200 XP.
- Hoàn tác trong 10 phút; sửa nhiệm vụ đã hoàn thành chỉ đổi tên/ghi chú; timer hết không tự hoàn thành nhiệm vụ hay cộng XP.
- Focus dài 5–120 phút; hành động ngắn có lựa chọn 2/5/10 phút và không dùng giới hạn tối thiểu của Focus.
- Bảo vệ native, quyền lịch, nguồn lịch ngoài và RPG được đánh dấu đúng là minh họa có điều kiện, mở rộng chưa triển khai hoặc concept.

## Giới hạn

Đây là bộ ảnh raster để duyệt hướng thiết kế và luồng, không phải giao diện native chạy được hoặc prototype nghiệp vụ. Kiểm tra PNG không chứng minh chữ trong từng ảnh hoàn hảo ở mọi kích thước. Bố cục khi mở bàn phím, cỡ chữ lớn/Dynamic Type, vùng chạm, tương phản, trình đọc màn hình, thao tác quay lại, đồng bộ, XP và hạn chế ứng dụng native cần được kiểm tra trên prototype/app thật.

Tương tác thư viện chưa được xác minh bằng browser vì Edge không khởi động được trong phiên. Ảnh concept có thể sai khác nhẹ về biểu tượng, viền, khoảng cách hoặc chi tiết trang trí; `DESIGN_SPEC.md`, `SCREEN_MAP.md` và yêu cầu dự án mới là căn cứ triển khai.
