// ===== CONSTANTS =====
const STORAGE_KEY = 'students';

// ===== DOM ELEMENTS =====
const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const studentZaloInput = document.getElementById('studentZalo');
const studentGmailInput = document.getElementById('studentGmail');
const studentsTableBody = document.getElementById('studentsTableBody');
const totalStudentsElement = document.getElementById('totalStudents');
const emptyState = document.getElementById('emptyState');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const toast = document.getElementById('toast');

// ===== STATE =====
let students = [];
let deleteStudentId = null;

// ===== INITIALIZATION =====
// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    renderStudents();
    updateStats();
});

// ===== LOCALSTORAGE FUNCTIONS =====
/**
 * Load danh sách học viên từ LocalStorage
 */
function loadStudents() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            students = JSON.parse(storedData);
        } catch (error) {
            console.error('Lỗi khi load dữ liệu:', error);
            students = [];
        }
    }
}

/**
 * Lưu danh sách học viên vào LocalStorage
 */
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
        showToast('Lỗi khi lưu dữ liệu!', 'error');
    }
}

// ===== FORM HANDLING =====
/**
 * Xử lý submit form thêm học viên
 */
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Lấy dữ liệu từ form
    const name = studentNameInput.value.trim();
    const zalo = studentZaloInput.value.trim();
    const gmail = studentGmailInput.value.trim();
    
    // Validate
    if (!name || !zalo || !gmail) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
        return;
    }
    
    // Validate email
    if (!isValidEmail(gmail)) {
        showToast('Email không hợp lệ!', 'error');
        return;
    }
    
    // Tạo học viên mới
    const newStudent = {
        id: Date.now(), // Sử dụng timestamp làm ID
        name: name,
        zalo: zalo,
        gmail: gmail,
        createdAt: new Date().toISOString()
    };
    
    // Thêm vào mảng
    students.push(newStudent);
    
    // Lưu vào LocalStorage
    saveStudents();
    
    // Render lại bảng
    renderStudents();
    
    // Cập nhật thống kê
    updateStats();
    
    // Reset form
    studentForm.reset();
    studentNameInput.focus();
    
    // Hiển thị thông báo
    showToast(`✓ Đã thêm học viên: ${name}`, 'success');
});

// ===== RENDER FUNCTIONS =====
/**
 * Render danh sách học viên ra bảng
 */
function renderStudents() {
    // Xóa nội dung cũ
    studentsTableBody.innerHTML = '';
    
    // Kiểm tra nếu không có học viên
    if (students.length === 0) {
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    // Render từng học viên
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.zalo)}</td>
            <td>${escapeHtml(student.gmail)}</td>
            <td>
                <button class="btn btn-danger btn-small" onclick="confirmDelete(${student.id})">
                    🗑️ Xóa
                </button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

/**
 * Cập nhật thống kê
 */
function updateStats() {
    totalStudentsElement.textContent = students.length;
}

// ===== DELETE FUNCTIONS =====
/**
 * Hiển thị modal xác nhận xóa
 */
function confirmDelete(studentId) {
    deleteStudentId = studentId;
    const student = students.find(s => s.id === studentId);
    
    if (student) {
        document.getElementById('confirmMessage').textContent = 
            `Bạn có chắc chắn muốn xóa học viên "${student.name}"?`;
        confirmModal.classList.add('show');
    }
}

/**
 * Xóa học viên
 */
function deleteStudent(studentId) {
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
        const studentName = students[studentIndex].name;
        students.splice(studentIndex, 1);
        saveStudents();
        renderStudents();
        updateStats();
        showToast(`✓ Đã xóa học viên: ${studentName}`, 'success');
    }
}

/**
 * Xác nhận xóa
 */
confirmDeleteBtn.addEventListener('click', () => {
    if (deleteStudentId) {
        deleteStudent(deleteStudentId);
        deleteStudentId = null;
    }
    confirmModal.classList.remove('show');
});

/**
 * Hủy xóa
 */
cancelDeleteBtn.addEventListener('click', () => {
    deleteStudentId = null;
    confirmModal.classList.remove('show');
});

/**
 * Đóng modal khi click bên ngoài
 */
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        deleteStudentId = null;
        confirmModal.classList.remove('show');
    }
});

/**
 * Xóa tất cả học viên
 */
clearAllBtn.addEventListener('click', () => {
    if (students.length === 0) {
        showToast('Danh sách đã trống!', 'warning');
        return;
    }
    
    document.getElementById('confirmMessage').textContent = 
        `Bạn có chắc chắn muốn xóa TẤT CẢ ${students.length} học viên?`;
    confirmModal.classList.add('show');
    
    // Đặt deleteStudentId = 'all' để phân biệt với xóa 1 học viên
    deleteStudentId = 'all';
});

// Cập nhật hàm confirmDeleteBtn để xử lý xóa tất cả
confirmDeleteBtn.addEventListener('click', () => {
    if (deleteStudentId === 'all') {
        students = [];
        saveStudents();
        renderStudents();
        updateStats();
        showToast('✓ Đã xóa tất cả học viên!', 'success');
    } else if (deleteStudentId) {
        deleteStudent(deleteStudentId);
    }
    deleteStudentId = null;
    confirmModal.classList.remove('show');
});

// ===== UTILITY FUNCTIONS =====
/**
 * Validate email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Hiển thị toast notification
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: success, error, warning
 */
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
/**
 * Xử lý phím tắt
 */
document.addEventListener('keydown', (e) => {
    // ESC để đóng modal
    if (e.key === 'Escape' && confirmModal.classList.contains('show')) {
        deleteStudentId = null;
        confirmModal.classList.remove('show');
    }
});

// ===== EXPORT/IMPORT (Bonus - có thể mở rộng sau) =====
/**
 * Export dữ liệu ra JSON file
 */
function exportData() {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_n5k2_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Đã export dữ liệu!', 'success');
}

/**
 * Import dữ liệu từ JSON file
 */
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedStudents = JSON.parse(e.target.result);
            if (Array.isArray(importedStudents)) {
                students = importedStudents;
                saveStudents();
                renderStudents();
                updateStats();
                showToast('✓ Đã import dữ liệu!', 'success');
            } else {
                showToast('File không đúng định dạng!', 'error');
            }
        } catch (error) {
            showToast('Lỗi khi đọc file!', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== CONSOLE INFO =====
console.log('%c🇯🇵 Dashboard Quản Lý Lớp N5K2', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cDữ liệu được lưu trong LocalStorage', 'color: #666; font-size: 12px;');
console.log('%cKey:', STORAGE_KEY, 'color: #999; font-size: 12px;');
