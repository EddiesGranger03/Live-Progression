# Đưa Solo Leveling lên GitHub

Mã nguồn chuẩn là thư mục `solo-leveling`, gồm cả Angular, FastAPI và Docker. Gói `Solo_Leveling_GitHub_Ready.zip` trên Desktop được xuất từ commit đã chuẩn bị, chỉ gồm mã nguồn để chuyển máy. Hai ZIP MVP/Docker cũ nằm trong `Solo_Leveling_Packages/archive`. Push nội dung repository, không upload các file ZIP vào repository.

## Những gì được đưa lên

- `frontend/`, `backend/` (cả kiểm thử), `docs/`, `scripts/`.
- `Dockerfile`, `compose.yaml`, `compose.share.yaml`, `.dockerignore`, các file mở nhanh và chia sẻ/tắt link HTTPS.
- `.gitignore`, `.gitattributes`, `.env.example`, `.env.docker.example` chỉ chứa cấu hình mẫu.
- `package.json`, **`package-lock.json`**, các cấu hình Angular và TypeScript; các file `requirements*.txt`.

Dependency, build, cache, `.env` thực, SQLite và dữ liệu tài khoản, kết quả kiểm thử, ZIP, private key, cấu hình hosting cá nhân được loại bởi `.gitignore`. Docker image dùng `.dockerignore` với danh sách file được phép; database và `.env` không nằm trong build context.

## Kiểm tra trước commit

Mở PowerShell **trong thư mục `solo-leveling`**:

```powershell
git status --short
git add --dry-run .
git ls-files -ci --exclude-standard
git check-ignore .env .env.production data/solo.db node_modules/ dist/ handoff.zip
```

`git ls-files -ci --exclude-standard` phải không có kết quả: không còn file đang được theo dõi nhưng thuộc nhóm cần ignore. `git check-ignore` phải liệt kê các đường dẫn ở dòng ví dụ. Hai file `.env.example` và `.env.docker.example` vẫn được commit.

`.gitignore` không tự bỏ theo dõi những file đã commit. Nếu sau này một file nhạy cảm đã vào Git, cần bỏ riêng file đó khỏi index, và nếu là secret thật thì thu hồi/thay secret rồi xử lý lịch sử Git. Chỉ thêm rule ignore không xóa nội dung trong commit cũ. Tham khảo [GitHub: Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files).

Gói bàn giao này đã có commit cục bộ trong thư mục làm việc của Sơn. Kiểm tra `git status` và `git log -1 --oneline` trước khi push. Khi có thay đổi mới, commit theo cách sau:

```powershell
git add .
git diff --cached --stat
git diff --cached --name-only
git commit -m "Prepare Solo Leveling source and Docker deployment"
```

## Kết nối GitHub

Repository của nhóm là **[EddiesGranger03/Live-Progression](https://github.com/EddiesGranger03/Live-Progression)**. Trên máy Sơn, remote `github` đã trỏ đến repository này; commit `LICENSE` có sẵn được giữ trong lịch sử. Với các thay đổi mới đã commit trên máy này, dùng:

```powershell
git push github main
```

Thư mục làm việc hiện tại trên máy Sơn đã có lịch sử Git. **Giữ nguyên lịch sử**, không xóa `.git` hoặc chạy `git init` lại. Kiểm tra remote trên máy bằng `git remote -v`. Gói ZIP không chứa `.git`; để push đúng lịch sử đã chuẩn bị trên máy này, dùng thư mục `solo-leveling` gốc.

Nếu kết nối một bản làm việc khác chưa có remote `github`, có thể thêm bằng:

```powershell
git remote add github https://github.com/EddiesGranger03/Live-Progression.git
git push github HEAD:main
```

Nếu đã có remote `github`, kiểm tra URL trước khi dùng; không thêm trùng. Nếu GitHub đã có commit riêng, fetch và xem lịch sử trước khi tích hợp, không dùng force push để ghi đè.

## Tạo lại gói nguồn sạch

Sau khi đã commit các thay đổi cần bàn giao:

```powershell
git archive --format=zip --prefix=solo-leveling/ --output=../Solo_Leveling_GitHub_Ready.zip HEAD
```

Lệnh này lấy đúng các file trong commit hiện tại, không gồm `.git`, dependency/build/cache hoặc dữ liệu riêng đã được bỏ theo dõi. File SHA-256 đi kèm gói hiện tại dùng để đối chiếu bản đã bàn giao; nếu tạo lại ZIP mới, tạo lại checksum tương ứng.

Nhóm có thể bắt đầu bằng repository private và mời hai thành viên; công khai sau khi thống nhất. Repository này không tự gán quyền quản trị website cho cộng tác viên GitHub. Thông tin đội ngũ được ghi trong README:

- **Nguyễn Vũ Gia Long:** người sáng lập, BA; truyền thông và giới thiệu dự án.
- **Nguyễn Khánh Sơn:** đồng sáng lập, developer; phát triển phần mềm và kỹ thuật.

## Chạy lại sau khi clone

```powershell
docker compose up -d --build --wait --wait-timeout 120
```

Mở `http://localhost:8080`. Máy mới tạo volume dữ liệu mới; dữ liệu người dùng không được chuyển qua GitHub. Khi cần chuyển dữ liệu thật, dùng quy trình backup/restore riêng.
