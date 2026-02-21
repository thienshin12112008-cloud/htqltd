// ===== CONSTANTS =====
const STUDENTS_KEY = 'students';
const ATTENDANCE_KEY = 'attendance';

// ===== DOM ELEMENTS =====
const attendanceDate = document.getElementById('attendanceDate');
const loadAttendanceBtn = document.getElementById('loadAttendanceBtn');
const attendanceList = document.getElementById('attendanceList');
const attendanceEmptyState = document.getElementById('attendanceEmptyState');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
const saveAttendanceSection = document.getElementById('saveAttendanceSection');
const historyTableBody = document.getElementById('historyTableBody');
const historyEmptyState = document.getElementById('historyEmptyState');
const studentStatsBody = document.getElementById('studentStatsBody');
const statsEmptyState = document.getElementById('statsEmptyState');
const totalSessionsElement = document.getElementById('totalSessions');
const avgAttendanceElement = document.getElementById('avgAttendance');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const toast = document.getElementById('toast');

// ===== STATE =====
let students = [];
let attendanceRecords = [];
let currentAttendance = {};
let currentDate = '';
let confirmAction = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Set ngày hiện tại
    attendanceDate.value = new Date().toISOString().split('T')[0];
    
    // Load dữ liệu
    loadStudents();
    loadAttendanceRecords();
    
    // Render
    renderHistory();
    renderStudentStats();
    updateStats();
});

// ===== LOCALSTORAGE FUNCTIONS =====
/**
 * Load danh sách học viên từ LocalStorage
 */
function loadStudents() {
    const storedData = localStorage.getItem(STUDENTS_KEY);
    if (storedData) {
        try {
            students = JSON.parse(storedData);
        } catch (error) {
            console.error('Lỗi khi load học viên:', error);
            students = [];
        }
    }
}

/**
 * Load lịch sử điểm danh từ LocalStorage
 */
function loadAttendanceRecords() {
    const storedData = localStorage.getItem(ATTENDANCE_KEY);
    if (storedData) {
        try {
            attendanceRecords = JSON.parse(storedData);
        } catch (error) {
            console.error('Lỗi khi load điểm danh:', error);
            attendanceRecords = [];
        }
    }
}

/**
 * Lưu lịch sử điểm danh vào LocalStorage
 */
function saveAttendanceRecords() {
    try {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords));
    } catch (error) {
        console.error('Lỗi khi lưu điểm danh:', error);
        showToast('Lỗi khi lưu dữ liệu!', 'error');
    }
}

// ===== ATTENDANCE FUNCTIONS =====
/**
 * Tải danh sách điểm danh cho ngày đã chọn
 */
loadAttendanceBtn.addEventListener('click', () => {
    const selectedDate = attendanceDate.value;
    
    if (!selectedDate) {
        showToast('Vui lòng chọn ngày!', 'warning');
        return;
    }
    
    if (students.length === 0) {
        showToast('Chưa có học viên nào trong hệ thống!', 'warning');
        return;
    }
    
    currentDate = selectedDate;
    
    // Kiểm tra xem ngày này đã điểm danh chưa
    const existingRecord = attendanceRecords.find(r => r.date === selectedDate);
    
    if (existingRecord) {
        currentAttendance = { ...existingRecord.attendance };
        showToast('Đã tải điểm danh có sẵn!', 'success');
    } else {
        // Khởi tạo điểm danh mới (mặc định tất cả có mặt)
        currentAttendance = {};
        students.forEach(student => {
            currentAttendance[student.id] = 'present';
        });
    }
    
    renderAttendanceList();
});

/**
 * Render danh sách điểm danh
 */
function renderAttendanceList() {
    attendanceList.innerHTML = '';
    
    if (students.length === 0) {
        attendanceEmptyState.classList.add('show');
        attendanceList.classList.remove('show');
        saveAttendanceSection.style.display = 'none';
        return;
    }
    
    attendanceEmptyState.classList.remove('show');
    attendanceList.classList.add('show');
    saveAttendanceSection.style.display = 'block';
    
    students.forEach(student => {
        const status = currentAttendance[student.id] || 'present';
        
        const item = document.createElement('div');
        item.className = 'attendance-item';
        item.innerHTML = `
            <div class="student-info">
                <div class="student-name">${escapeHtml(student.name)}</div>
                <div class="student-contact">📱 ${escapeHtml(student.zalo)} • 📧 ${escapeHtml(student.gmail)}</div>
            </div>
            <div class="attendance-options">
                <button class="attendance-btn present ${status === 'present' ? 'active' : ''}" 
                        onclick="setAttendance(${student.id}, 'present')">
                    ✓ Có mặt
                </button>
                <button class="attendance-btn absent ${status === 'absent' ? 'active' : ''}" 
                        onclick="setAttendance(${student.id}, 'absent')">
                    ✗ Vắng
                </button>
                <button class="attendance-btn late ${status === 'late' ? 'active' : ''}" 
                        onclick="setAttendance(${student.id}, 'late')">
                    ⏰ Trễ
                </button>
            </div>
        `;
        
        attendanceList.appendChild(item);
    });
    
    // Thêm summary
    renderAttendanceSummary();
}

/**
 * Set trạng thái điểm danh cho học viên
 */
window.setAttendance = function(studentId, status) {
    currentAttendance[studentId] = status;
    renderAttendanceList();
}

/**
 * Render tóm tắt điểm danh
 */
function renderAttendanceSummary() {
    const summary = calculateAttendanceSummary(currentAttendance);
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'attendance-summary';
    summaryDiv.innerHTML = `
        <div class="summary-item present">
            <div class="label">Có mặt</div>
            <div class="value">${summary.present}</div>
        </div>
        <div class="summary-item absent">
            <div class="label">Vắng</div>
            <div class="value">${summary.absent}</div>
        </div>
        <div class="summary-item late">
            <div class="label">Trễ</div>
            <div class="value">${summary.late}</div>
        </div>
        <div class="summary-item">
            <div class="label">% Chuyên cần</div>
            <div class="value" style="color: #667eea;">${summary.percentage}%</div>
        </div>
    `;
    
    attendanceList.appendChild(summaryDiv);
}

/**
 * Tính tóm tắt điểm danh
 */
function calculateAttendanceSummary(attendance) {
    let present = 0, absent = 0, late = 0;
    
    Object.values(attendance).forEach(status => {
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'late') late++;
    });
    
    const total = present + absent + late;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, percentage };
}

/**
 * Lưu điểm danh
 */
saveAttendanceBtn.addEventListener('click', () => {
    if (!currentDate) {
        showToast('Vui lòng chọn ngày!', 'warning');
        return;
    }
    
    // Kiểm tra xem ngày này đã có chưa
    const existingIndex = attendanceRecords.findIndex(r => r.date === currentDate);
    
    const record = {
        date: currentDate,
        attendance: { ...currentAttendance },
        timestamp: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        // Cập nhật
        attendanceRecords[existingIndex] = record;
        showToast('✓ Đã cập nhật điểm danh!', 'success');
    } else {
        // Thêm mới
        attendanceRecords.push(record);
        showToast('✓ Đã lưu điểm danh!', 'success');
    }
    
    // Sắp xếp theo ngày giảm dần
    attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    saveAttendanceRecords();
    renderHistory();
    renderStudentStats();
    updateStats();
});

// ===== HISTORY FUNCTIONS =====
/**
 * Render lịch sử điểm danh
 */
function renderHistory() {
    historyTableBody.innerHTML = '';
    
    if (attendanceRecords.length === 0) {
        historyEmptyState.classList.add('show');
        return;
    }
    
    historyEmptyState.classList.remove('show');
    
    attendanceRecords.forEach(record => {
        const summary = calculateAttendanceSummary(record.attendance);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${formatDate(record.date)}</strong></td>
            <td><span style="color: #51cf66;">✓ ${summary.present}</span></td>
            <td><span style="color: #ff4757;">✗ ${summary.absent}</span></td>
            <td><span style="color: #ffa502;">⏰ ${summary.late}</span></td>
            <td><strong>${summary.percentage}%</strong></td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editAttendance('${record.date}')">
                    ✏️ Sửa
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteAttendance('${record.date}')">
                    🗑️ Xóa
                </button>
            </td>
        `;
        
        historyTableBody.appendChild(row);
    });
}

/**
 * Sửa điểm danh
 */
window.editAttendance = function(date) {
    attendanceDate.value = date;
    loadAttendanceBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Đã tải điểm danh để chỉnh sửa!', 'success');
}

/**
 * Xóa điểm danh
 */
window.deleteAttendance = function(date) {
    confirmAction = () => {
        const index = attendanceRecords.findIndex(r => r.date === date);
        if (index !== -1) {
            attendanceRecords.splice(index, 1);
            saveAttendanceRecords();
            renderHistory();
            renderStudentStats();
            updateStats();
            showToast('✓ Đã xóa điểm danh!', 'success');
        }
    };
    
    document.getElementById('confirmMessage').textContent = 
        `Bạn có chắc chắn muốn xóa điểm danh ngày ${formatDate(date)}?`;
    confirmModal.classList.add('show');
}

/**
 * Xóa toàn bộ lịch sử
 */
clearHistoryBtn.addEventListener('click', () => {
    if (attendanceRecords.length === 0) {
        showToast('Lịch sử đã trống!', 'warning');
        return;
    }
    
    confirmAction = () => {
        attendanceRecords = [];
        saveAttendanceRecords();
        renderHistory();
        renderStudentStats();
        updateStats();
        showToast('✓ Đã xóa toàn bộ lịch sử!', 'success');
    };
    
    document.getElementById('confirmMessage').textContent = 
        `Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử điểm danh (${attendanceRecords.length} buổi)?`;
    confirmModal.classList.add('show');
});

// ===== STUDENT STATS FUNCTIONS =====
/**
 * Render thống kê từng học viên
 */
function renderStudentStats() {
    studentStatsBody.innerHTML = '';
    
    if (students.length === 0 || attendanceRecords.length === 0) {
        statsEmptyState.classList.add('show');
        return;
    }
    
    statsEmptyState.classList.remove('show');
    
    students.forEach(student => {
        const stats = calculateStudentStats(student.id);
        
        let statusClass = 'excellent';
        let statusText = 'Xuất sắc';
        
        if (stats.percentage < 45) {
            statusClass = 'danger';
            statusText = 'Cảnh báo';
        } else if (stats.percentage < 70) {
            statusClass = 'warning';
            statusText = 'Trung bình';
        } else if (stats.percentage < 85) {
            statusClass = 'good';
            statusText = 'Khá';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${stats.total}</td>
            <td><span style="color: #51cf66;">${stats.present}</span></td>
            <td><span style="color: #ff4757;">${stats.absent}</span></td>
            <td><span style="color: #ffa502;">${stats.late}</span></td>
            <td><strong>${stats.percentage}%</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        
        studentStatsBody.appendChild(row);
    });
}

/**
 * Tính thống kê cho 1 học viên
 */
function calculateStudentStats(studentId) {
    let total = 0, present = 0, absent = 0, late = 0;
    
    attendanceRecords.forEach(record => {
        if (record.attendance[studentId]) {
            total++;
            const status = record.attendance[studentId];
            if (status === 'present') present++;
            else if (status === 'absent') absent++;
            else if (status === 'late') late++;
        }
    });
    
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, late, percentage };
}

// ===== STATS FUNCTIONS =====
/**
 * Cập nhật thống kê tổng quan
 */
function updateStats() {
    totalSessionsElement.textContent = attendanceRecords.length;
    
    if (attendanceRecords.length === 0 || students.length === 0) {
        avgAttendanceElement.textContent = '0%';
        return;
    }
    
    let totalPercentage = 0;
    students.forEach(student => {
        const stats = calculateStudentStats(student.id);
        totalPercentage += stats.percentage;
    });
    
    const avgPercentage = Math.round(totalPercentage / students.length);
    avgAttendanceElement.textContent = avgPercentage + '%';
}

// ===== MODAL FUNCTIONS =====
confirmBtn.addEventListener('click', () => {
    if (confirmAction) {
        confirmAction();
        confirmAction = null;
    }
    confirmModal.classList.remove('show');
});

cancelBtn.addEventListener('click', () => {
    confirmAction = null;
    confirmModal.classList.remove('show');
});

confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmAction = null;
        confirmModal.classList.remove('show');
    }
});

// ===== UTILITY FUNCTIONS =====
/**
 * Format ngày
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Hiển thị toast
 */
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal.classList.contains('show')) {
        confirmAction = null;
        confirmModal.classList.remove('show');
    }
});

// ===== CONSOLE INFO =====
console.log('%c✅ Điểm danh - Lớp N5K2', 'color: #51cf66; font-size: 20px; font-weight: bold;');
console.log('%cDữ liệu lưu trong LocalStorage', 'color: #666; font-size: 12px;');
