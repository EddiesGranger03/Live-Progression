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

## Kiểm chứng mobile và nhắc mạng xã hội — 21/10/2026

- `npm run check`: PASS.
- `npm run build`: PASS; Angular production bundle được tạo.
- `npx cap sync`: PASS cho Android và iOS sau khi bỏ thuộc tính ReadOnly khỏi đúng hai thư mục asset do Capacitor sinh.
- Android `assembleDebug`: PASS với JDK 21 / Gradle 8.14.3. APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`.
- AVD `emulator-5554`: cài APK cuối và mở được. Luồng Quick Action 2 phút chạy được; chọn **Bỏ qua** trả về form, giữ XP ở 140 và nhiệm vụ vẫn chờ xác nhận. Gợi ý dài hơn thời lượng đã chọn không còn xuất hiện; ảnh cuối ở `artifacts/solo-leveling-android-quick-final.png`.
- Bảo vệ Focus mở được và hiện đúng trạng thái khi chưa cấp quyền. Android AccessibilityService chỉ subscribe `TYPE_WINDOW_STATE_CHANGED`, giới hạn package đã chọn và khai báo `canRetrieveWindowContent=false`; service không đọc text/window tree. Không cấp Usage Access/notification/Trợ năng trên AVD và emulator không có các app social nên chưa kiểm chứng nhắc hoặc overlay end-to-end.
- `python -m pytest backend/tests -q --basetemp artifacts/pytest-final`: 16 passed; 1 cảnh báo deprecation từ Starlette/AnyIO.
- iOS: project và plugin Swift được tạo. Máy local Windows không có Xcode; GitHub Actions trên macOS/Xcode 26.6 đã build thành công target iOS Simulator, không ký app. Screen Time restriction vẫn chưa được triển khai; cần Family Controls entitlement, extension và provisioning trước khi kiểm thử trên thiết bị.
- Android: lời nhắc Usage Access và che app bằng AccessibilityService được tách riêng, tự nguyện và chỉ trong Focus. Screen overlay cho phép mở Solo Leveling, tạm bỏ qua 10 phút cho đúng app hiện tại, hoặc tắt che tới hết phiên. UsageStats xử lý tên package được chọn, không lưu nội dung. Chưa kiểm tra end-to-end trên thiết bị có TikTok/Instagram/Facebook và chưa bật quyền trên emulator.
- Google Play release vẫn cần AccessibilityService declaration/review, Data safety và công khai API trong listing; foreground service `specialUse` cũng cần khai báo/review phù hợp. Build debug không chứng minh việc được duyệt.

## Mục tiêu độc lập và liên kết nhiệm vụ — 21/10/2026

- Backend pytest: 19 passed; 1 cảnh báo deprecation từ Starlette/AnyIO.
- SQLite nâng `user_version` lên 3 theo migration cộng thêm: tạo bảng `goals` và thêm `quests.goal_id`; migration test xác nhận nhiệm vụ cũ giữ nguyên và liên kết ban đầu là `NULL`.
- Angular `npm run check` và production build: PASS sau khi bổ sung tra cứu mục tiêu có kiểu rõ ràng ở màn hình chi tiết nhiệm vụ.
- Playwright qua Microsoft Edge: PASS luồng tạo mục tiêu → tạo nhiệm vụ liên kết → đổi ưu tiên → lưu trữ → khôi phục → tải lại. Không có lỗi JavaScript và không tràn ngang ở chiều rộng 360px. Ảnh kiểm tra: `artifacts/goal-detail-mobile.png`.
- Demo và API cùng dùng các thao tác `goal.save`, `goal.priority`, `goal.archive`; `goalId` là liên kết tùy chọn trên nhiệm vụ và không thay trường lĩnh vực `goal` hiện có.
- Mục tiêu ưu tiên chỉ thay thứ tự hiển thị; lưu trữ/khôi phục không xóa nhiệm vụ hoặc ledger XP.
- Android: `npm run mobile:sync` và Gradle `assembleDebug` PASS; APK đã cài đè bằng `adb install -r` lên `emulator-5554`, mở app và điều hướng tới danh sách Mục tiêu được. Cache trải nghiệm cũ có 0 mục tiêu độc lập; UI hiển thị empty state và nút tạo mới đúng.
- iOS Screen Time vẫn chưa được triển khai/kiểm chứng: Xcode CI đã build simulator, nhưng app/extension chưa được ký và chạy trên thiết bị; cần Family Controls entitlement và cấu hình extension/provisioning trước khi xác minh luồng thật.

## Hoàn thiện restriction tự nguyện — 21/10/2026

- `npm run check`, `npm run build`, `npx cap sync android`: PASS sau khi hoàn thiện state đồng bộ permission, Focus và overlay.
- Backend pytest: 19 passed, 1 cảnh báo deprecation Starlette/AnyIO.
- Android debug APK: `assembleDebug` PASS với bản Gradle 9.6.0/AGP 9.4.1 đã có sẵn trong cache vì wrapper Gradle 8.14.3 không tải được distribution trong môi trường hiện tại. Hai file cấu hình build tạm được đổi để kiểm tra và đã khôi phục về Gradle 8.14.3/AGP 8.13.0; build pinned nguyên trạng cần chạy lại khi distribution có sẵn.
- APK cuối đã cài đè và mở được trên `emulator-5554`. Protection page và disclosure được xem ở kích thước điện thoại; hộp thoại phủ đúng màn hình và từ chối consent giữ switch ở trạng thái tắt. Ảnh: `artifacts/solo-leveling-final-disclosure.png`, `artifacts/solo-leveling-toggle-after-decline.png`.
- Chưa cấp quyền Trợ năng/Usage Access và emulator không có TikTok, Instagram hoặc Facebook; vì vậy overlay, bypass 10 phút, notification và reminder nghỉ chưa được chạy end-to-end với app thật.
- Không có thay đổi API/backend cho restriction; lựa chọn package, consent và thời gian bypass được lưu cục bộ trên thiết bị.
- Trước khi phát hành cần Google Play AccessibilityService declaration/review, Data safety/listing và review foreground-service `specialUse`.

## Chuẩn bị repository công khai — 22/10/2026

- Trên Windows / Node.js 24.21.0, `npm run check` và `npm run build`: PASS.
- Sáu workflow/Issue YAML parse được bằng PyYAML 6.0.3; `git diff --cached --check`: PASS.
- Backend pytest trên Windows / Python 3.14.7 bị treo khi Starlette `TestClient` mở AnyIO blocking portal. `faulthandler` chỉ ra Proactor event loop đang chờ `socket.accept()` trong `_make_self_pipe`; đây không phải kết quả test đạt. Workflow CI chạy pytest trên Ubuntu / Python 3.12 để kiểm tra riêng môi trường Linux.
- GitHub Actions run #2 cho commit `90831f6`: PASS cả bốn job. Backend `19 passed` (1 cảnh báo deprecation Starlette/AnyIO); Android `assembleDebug` PASS với Gradle 8.14.3 / AGP 8.13.0 / JDK 21; iOS simulator build PASS trên Xcode 26.6, không ký app.
- `npm ci` báo 5 npm audit findings (1 low, 3 moderate, 1 high) trong dependency tree. `npm audit fix --dry-run` đề xuất 0 cập nhật tự động; gợi ý hạ `@capacitor/cli` cần kiểm tra tương thích. Đã theo dõi tại [Issue #5](https://github.com/EddiesGranger03/Live-Progression/issues/5); chưa khẳng định các package này có trong runtime production.
- Build iOS simulator chỉ xác nhận project compile được; không đồng nghĩa Screen Time restriction đã triển khai hoặc được Apple cấp entitlement. Android CI cũng không thay thế kiểm thử overlay trên thiết bị có app mạng xã hội thật.
