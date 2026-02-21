# 🚀 Bắt đầu nhanh - App N5K2

## ⚡ 3 bước để có app hoàn chỉnh

### Bước 1: Tạo icon (2 phút)

```
1. Mở file: generate-icon.html
2. Click: "📥 Tải 192x192" → Lưu thành icon-192.png
3. Click: "📥 Tải 512x512" → Lưu thành icon-512.png
4. Copy 2 file vào thư mục gốc
```

**Kết quả:** Có 3 file icon
- ✅ favicon.png (đã có)
- ⚠️ icon-192.png (cần tạo)
- ⚠️ icon-512.png (cần tạo)

### Bước 2: Chạy web server (1 phút)

**Chọn 1 trong các cách:**

**Cách 1: Python** (Đơn giản nhất)
```bash
python -m http.server 8000
```

**Cách 2: Node.js**
```bash
npx http-server
```

**Cách 3: VS Code**
- Cài extension "Live Server"
- Click chuột phải → "Open with Live Server"

**Cách 4: XAMPP**
- Copy thư mục vào htdocs
- Truy cập: http://localhost/n5k2-management

### Bước 3: Mở và test (1 phút)

```
1. Mở: http://localhost:8000
2. Thêm vài học viên
3. Thử điểm danh
4. Nhập điểm
5. Xem báo cáo
```

## 🎯 Xong! Giờ có thể:

- ✅ Sử dụng trên máy tính
- ✅ Cài đặt như app
- ✅ Dùng trên điện thoại
- ✅ Hoạt động offline

## 📱 Cài app trên điện thoại

### Android:
1. Mở website bằng Chrome
2. Đợi thông báo "Cài đặt app"
3. Click "Cài đặt"
4. Xong!

### iPhone:
1. Mở bằng Safari
2. Nhấn nút "Chia sẻ" (mũi tên lên)
3. Chọn "Thêm vào Màn hình chính"
4. Xong!

## 🌐 Deploy online (Tùy chọn)

Nếu muốn dùng từ xa:

**GitHub Pages** (Miễn phí, dễ nhất)
```bash
1. Tạo repo GitHub
2. Push code lên
3. Settings → Pages → Deploy
4. Truy cập: https://username.github.io/repo-name
```

**Netlify** (Miễn phí, nhanh nhất)
```
1. Vào netlify.com
2. Kéo thả thư mục vào
3. Xong! Có link ngay
```

## ❓ Câu hỏi thường gặp

**Q: Không thấy nút cài đặt app?**
- Đảm bảo đã tạo đủ 3 file icon
- Dùng HTTPS hoặc localhost
- Refresh trang (F5)

**Q: Icon không hiển thị?**
- Kiểm tra tên file: icon-192.png, icon-512.png
- Xóa cache (Ctrl + Shift + Delete)
- Cài lại app

**Q: Dữ liệu bị mất?**
- Không xóa cache trình duyệt
- Backup bằng nút "Xuất Excel"
- Dữ liệu lưu trong LocalStorage

**Q: Không hoạt động offline?**
- Mở app khi có mạng ít nhất 1 lần
- Đợi Service Worker cài đặt
- Kiểm tra Console (F12)

## 📚 Tài liệu đầy đủ

- `README.md` - Tổng quan
- `HUONG_DAN_CAI_APP.md` - Cài đặt app
- `HUONG_DAN_TAO_ICON.md` - Tạo icon
- `CHECKLIST_HOAN_THANH.md` - Checklist

## 🎉 Thành công!

Bây giờ bạn có:
- ✅ Website quản lý học viên
- ✅ App cài được trên điện thoại
- ✅ Hoạt động offline
- ✅ Dữ liệu lưu trên máy

**Chúc bạn sử dụng hiệu quả! 🚀**
