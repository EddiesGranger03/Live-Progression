# Kiến trúc triển khai

Angular standalone + Signals, tổ chức theo feature; lớp AppStore làm việc với API hoặc bộ lưu dữ liệu demo trên thiết bị. FastAPI modular monolith; quy tắc thuần Python nằm trong domain, application điều phối transaction, SQLite adapter nằm trong infrastructure. REST `/api/v1` có OpenAPI tại `/docs`.

SQLite WAL dành cho chạy local và kiểm chứng MVP. Không tuyên bố hỗ trợ hàng nghìn người đồng thời. Trước triển khai nhiều instance, chuyển repository sang PostgreSQL và dùng dịch vụ xác thực/email được quản lý.

Web build tĩnh trên Sites chạy chế độ trải nghiệm có ghi nhãn, lưu localStorage; không giả vờ đã có FastAPI hoặc tài khoản cloud trên hosting tĩnh. Bản FastAPI local phục vụ cùng frontend, tài khoản thật và dữ liệu SQLite riêng mỗi người dùng.

Các module nghiệp vụ: tài khoản, hồ sơ, nhiệm vụ/completion/XP ledger, lịch, Focus. Chưa cần AI workers, hàng đợi hay microservices. Bổ sung các module đó khi có yêu cầu được kiểm chứng.
