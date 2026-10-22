import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const base=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(base,name),'utf8').replace(/^\uFEFF/,'');
const write=(name,content)=>fs.writeFileSync(path.join(base,name),content,'utf8');
const extra=JSON.parse(read('coverage-additions.json')).map(s=>({...s,phase:s.source==='later'?'Mở rộng':'Cốt lõi',platforms:['ios','android'],revision:'2026-10-16'}));
for(const s of extra)for(const p of s.platforms)for(const file of [`images/${p}/${s.id}.png`,`prompts/${p}-${s.id}.txt`]){
 if(!fs.existsSync(path.join(base,file)))throw new Error('Not ready: '+file);
}
const catalog=JSON.parse(read('catalog.json'));
const groups=[...new Set(catalog.screens.map(s=>s.group))];
const byId=new Map(catalog.screens.map(s=>[s.id,s]));
for(const s of extra)byId.set(s.id,s);
const screens=[...byId.values()].sort((a,b)=>groups.indexOf(a.group)-groups.indexOf(b.group)||a.id.localeCompare(b.id,'en',{numeric:true}));
for(const [id,title]of [['G03','Chỉnh sửa mục tiêu'],['Q03','Tạo nhiệm vụ'],['C02','Tạo khung giờ'],['P03','Giải thích XP và Level']])screens.find(s=>s.id===id).title=title;
catalog.screens=screens;catalog.updated='2026-10-16';
write('catalog.json',JSON.stringify(catalog,null,2)+'\n');
let html=read('index.html');
html=html.replace(/^const screens=.*;$/m,'const screens='+JSON.stringify(screens)+';')
 .replace(/\d+ màn hình & trạng thái/,screens.length+' màn hình & trạng thái')
 .replace(/\d+ ảnh riêng/,(screens.length*2)+' ảnh riêng')
 .replace('15.10.2026','Cập nhật 16.10.2026')
 .replace('DESIGN HANDOFF 01','DESIGN HANDOFF 02');
if(!html.includes('href="COVERAGE_AUDIT.md"'))html=html.replace('<a href="QA.md">','<a href="COVERAGE_AUDIT.md">Đối chiếu độ đầy đủ ↗</a><a href="QA.md">');
write('index.html',html);
const sources={web:'Website hiện tại',new:'Mô tả sản phẩm + hợp nhất đã duyệt',native:'Yêu cầu native + tài liệu nền tảng',later:'Tích hợp mở rộng đã duyệt',concept:'Ảnh tham chiếu + concept tương lai'};
const rows=screens.map(s=>`| ${s.id} | ${s.group} | ${s.title} | ${s.type} | ${s.entry} | ${s.phase} | ${sources[s.source]} |`).join('\n');
const shared=`## Biến thể và thành phần dùng chung
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
`;
write('SCREEN_MAP.md',`# Bản đồ chức năng → giao diện\n\n${screens.length} màn hình/trạng thái, mỗi mục có ảnh iOS và Android: ${screens.length*2} ảnh. Cập nhật 16/10/2026. Xem COVERAGE_AUDIT.md để đối chiếu lần bổ sung.\n\n| ID | Nhóm | Giao diện | Dạng | Điểm vào | Giai đoạn | Nguồn |\n|---|---|---|---|---|---|---|\n${rows}\n\n${shared}`);
let readme=read('README.md').replace('Ngày bàn giao: 15/10/2026','Bản đầu: 15/10/2026 · Cập nhật: 16/10/2026').replace('danh mục 64 màn hình/trạng thái',`danh mục ${screens.length} màn hình/trạng thái`);
if(!readme.includes('`COVERAGE_AUDIT.md`'))readme=readme.replace('- `QA.md`','- `COVERAGE_AUDIT.md`: đối chiếu độ đầy đủ, 20 trạng thái bổ sung.\n- `QA.md`');
if(!readme.includes('168 ảnh PNG'))readme=readme.replace('## Mở bộ thiết kế','Bộ hiện tại gồm **84 màn hình/trạng thái và 168 ảnh PNG**, sau khi bổ sung các biến thể còn thiếu ảnh riêng. Các nhóm chính đã có từ bản đầu; không coi mỗi tổ hợp dữ liệu là một màn hình mới.\n\n## Mở bộ thiết kế');
write('README.md',readme);
write('QA.md',read('QA.md').replace('Ngày: 15/10/2026','Bản đầu: 15/10/2026 · Bổ sung: 16/10/2026').replace('64 màn hình/trạng thái','84 màn hình/trạng thái').replace('128 PNG độc lập và 128 prompt gốc','168 PNG độc lập và 168 prompt gốc').replace('đủ 64 mục','đủ 84 mục')+'\n## Bổ sung sau đối chiếu 16/10/2026\n\n20 trạng thái (40 ảnh) được tách riêng thay cho chỉ mô tả trong component: A06–A07, G05–G06, Q07–Q11, C09, F05–F06, B06, S07–S10, U07, I04–I05. Có bảng ánh xạ chi tiết tại `COVERAGE_AUDIT.md`. Kiểm tra tệp/gallery được chạy lại theo catalog mới; nhãn native và mở rộng giữ nguyên giới hạn triển khai.\n');
write('DESIGN_SPEC.md',read('DESIGN_SPEC.md')+'\n## Ảnh trạng thái bổ sung 16/10/2026\n\nẢnh riêng cho tạo mục tiêu G05, sửa nhiệm vụ Q07, lưu trữ nhiệm vụ Q08, trường bị khóa Q09, hoàn tác Q10 và hết hạn Q11. C09 minh họa sửa khung nghỉ; F05 là chọn thời lượng tùy chỉnh 5–120 phút. G06 chọn ưu tiên dạng boolean, không thêm công thức chấm điểm.\n\nB06 biểu thị cấu hình sẵn sàng nhưng chưa bắt đầu phiên; F06 chỉ minh họa trạng thái native đã xác nhận trong phiên. Cả hai đều có nhãn cần thử thiết bị. A06 không xác nhận tài khoản tồn tại khi báo gửi email; A07 giữ form khi gửi lỗi. S07/S08 giữ ngữ cảnh tìm kiếm/chọn thời lượng. S09 giữ bản nháp khi lưu lỗi; S10 lưu thành công chưa làm nhiệm vụ hoàn thành và không cấp XP. U07 xác nhận tùy chọn cũ/mới. I04/I05 vẫn là mở rộng chưa triển khai.\n');
write('USER_GUIDE.md',read('USER_GUIDE.md')+'\n## Ảnh tình huống chi tiết bổ sung\n\n- Tạo mục tiêu trống: G05; chọn ưu tiên: G06. Sửa nhiệm vụ: Q07; lưu trữ: Q08.\n- Nhiệm vụ đã hoàn thành chỉ sửa tên/ghi chú: Q09. Bấm hoàn tác trong hạn: Q10; hết 10 phút: Q11.\n- Đặt thời lượng Focus tùy chỉnh: F05. Cấu hình bảo vệ sẵn sàng: B06; phiên có xác nhận native: F06 (minh họa cần thử thiết bị).\n- Không tìm được nhiệm vụ: S07; không có hành động ngắn phù hợp: S08. Lỗi lưu giữ bản nháp: S09; lưu thành công: S10.\n- Gửi hướng dẫn mật khẩu: A06/A07. Sửa khung nghỉ: C09. Xác nhận giờ hoạt động: U07. Lịch ngoài thiếu quyền/cũ: I04/I05.\n');
console.log(JSON.stringify({states:screens.length,images:screens.length*2,addedStates:extra.length}));
