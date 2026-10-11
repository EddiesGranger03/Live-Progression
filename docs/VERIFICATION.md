# Kết quả kiểm tra — 11/10/2026

- Angular production build: PASS.
- Backend pytest: 14 passed; 1 cảnh báo deprecation từ Starlette/AnyIO, không ảnh hưởng kết quả.
- Edge desktop 1440px và mobile 360px: PASS, không cuộn ngang trên sáu trang chính.
- Lỗi JavaScript trong các luồng trình duyệt: 0.

## Luồng trải nghiệm

- Dashboard desktop renders with correct 1340 XP / Level 7.
- Complete and undo update XP exactly once.
- Focus survives reload and navigation; early end leaves quest pending.
- Timer expiry grants no XP.
- Create and delete schedule block.
- Gap suggestion schedules existing quest with five-minute buffer.
- All six main views fit a 360px screen without horizontal scrolling.
- Profile persists after reload.
- Escape protects unsaved drafts; native dialog traps keyboard focus.

## Luồng FastAPI thực

- Real signup and three-step onboarding.
- New account starts at Level 1 with no sample data.
- Create and complete quest through FastAPI; +20 XP persists after reload.
- Offline completion shows pending XP, synchronizes once on reconnect, and preserves confirmed XP until accepted.
- Logout revokes session and login restores the same data.

## Phần cần cấu hình / kiểm chứng tiếp

- SMTP và email xác minh: chưa có nhà cung cấp/credentials từ chủ dự án; reset email cần cấu hình SMTP trước khi dùng.
- Chưa kiểm tải production, đa instance, khôi phục backup hoặc iPhone native.
- Đang ngoại tuyến: kết quả mới là dự kiến tới khi server chấp nhận. Bản nháp xung đột không ghi đè âm thầm.
- Thông báo cần quyền trình duyệt và app đang mở; không hứa push sau khi trình duyệt đóng.
