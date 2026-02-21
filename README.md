# 🇯🇵 Dashboard Quản Lý Lớp N5K2

Website dashboard quản lý học viên cho giáo viên lớp Tiếng Nhật N5K2. Sử dụng HTML, CSS, JavaScript thuần và LocalStorage.

## 📱 Progressive Web App (PWA)

Website có thể cài đặt như app thật trên điện thoại và máy tính!

### Tính năng PWA:
- ✅ Cài đặt như app native
- ✅ Hoạt động offline
- ✅ Icon trên màn hình chính
- ✅ Không có thanh địa chỉ
- ✅ Tốc độ load nhanh
- ✅ Tự động cập nhật

👉 Xem [HUONG_DAN_CAI_APP.md](HUONG_DAN_CAI_APP.md) để biết cách cài đặt

## ✨ Tính năng

### 📊 Dashboard
- Hiển thị tổng số học viên
- Giao diện hiện đại, chuyên nghiệp
- Responsive trên mọi thiết bị

### ➕ Quản lý học viên
- Thêm học viên mới (Họ tên, Zalo, Gmail)
- Hiển thị danh sách học viên dạng bảng
- Xóa từng học viên
- Xóa tất cả học viên
- Xác nhận trước khi xóa

### 💾 Lưu trữ
- Dữ liệu lưu trong LocalStorage
- Tự động load khi mở lại trang
- Không cần backend hay database

### 🎨 Giao diện
- Thiết kế gradient đẹp mắt
- Hiệu ứng hover mượt mà
- Toast notification
- Modal xác nhận
- Empty state khi chưa có dữ liệu

## 🚀 Cách sử dụng

### Cài đặt
1. Tải 3 file: `index.html`, `style.css`, `app.js`
2. Đặt cùng 1 thư mục
3. Mở file `index.html` bằng trình duyệt

### Thêm học viên
1. Điền đầy đủ: Họ tên, Zalo, Gmail
2. Click "Thêm học viên"
3. Dữ liệu tự động lưu vào LocalStorage

### Xóa học viên
1. Click nút "🗑️ Xóa" ở học viên muốn xóa
2. Xác nhận trong modal
3. Học viên sẽ bị xóa khỏi danh sách

### Xóa tất cả
1. Click nút "🗑️ Xóa tất cả" ở góc phải
2. Xác nhận trong modal
3. Toàn bộ danh sách sẽ bị xóa

## 📁 Cấu trúc file

```
n5k2-dashboard/
├── index.html      # Giao diện HTML
├── style.css       # CSS styling
├── app.js          # JavaScript logic
└── README.md       # Hướng dẫn
```

## 🎯 Công nghệ

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling, animations, responsive
- **JavaScript ES6+**: Logic xử lý
- **LocalStorage API**: Lưu trữ dữ liệu

## 🔧 Tính năng kỹ thuật

### Validation
- Kiểm tra form không được để trống
- Validate định dạng email
- Escape HTML để tránh XSS

### UX/UI
- Toast notification tự động ẩn sau 3 giây
- Modal xác nhận trước khi xóa
- Empty state khi chưa có dữ liệu
- Loading animation mượt mà
- Hover effects trên buttons

### Responsive
- Desktop: Hiển thị đầy đủ
- Tablet: Tối ưu layout
- Mobile: Ẩn cột Zalo, điều chỉnh font size

### Keyboard Shortcuts
- `ESC`: Đóng modal

## 📱 Responsive Breakpoints

- Desktop: > 768px
- Tablet: 768px
- Mobile: < 480px

## 💡 Mở rộng trong tương lai

Website được thiết kế dễ mở rộng:

### Có thể thêm:
- ✅ Chức năng điểm danh
- 📝 Quản lý bài tập
- 📊 Thống kê chi tiết hơn
- 📚 Quản lý tài liệu
- 📢 Thông báo
- 📤 Export/Import dữ liệu (đã có hàm sẵn)
- 🔍 Tìm kiếm học viên
- ✏️ Sửa thông tin học viên
- 📈 Biểu đồ thống kê

### Cách mở rộng:
1. Thêm trường mới vào object `student` trong `app.js`
2. Cập nhật form trong `index.html`
3. Cập nhật bảng hiển thị
4. Thêm CSS tương ứng

## 🎨 Tùy chỉnh màu sắc

Trong file `style.css`, tìm và thay đổi:

```css
/* Màu gradient chính */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Màu primary */
color: #667eea;
```

## 🔒 Bảo mật

- Escape HTML output để tránh XSS
- Validate input trước khi lưu
- Không lưu thông tin nhạy cảm trong LocalStorage

## ⚠️ Lưu ý

- Dữ liệu lưu trong LocalStorage của trình duyệt
- Xóa cache/data trình duyệt sẽ mất dữ liệu
- Nên backup dữ liệu định kỳ (có thể dùng hàm export)
- LocalStorage có giới hạn ~5-10MB

## 🐛 Xử lý lỗi

### Mất dữ liệu
- Kiểm tra LocalStorage: F12 > Application > Local Storage
- Key: `students`

### Không lưu được
- Kiểm tra dung lượng LocalStorage
- Thử xóa dữ liệu cũ không cần thiết

### Lỗi hiển thị
- Hard refresh: Ctrl + F5
- Xóa cache trình duyệt

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) xem có lỗi không
2. Đảm bảo 3 file cùng thư mục
3. Thử trình duyệt khác

## 📝 License

Free to use - Dự án học tập

---

**Chúc bạn quản lý lớp học hiệu quả! 🎉**
