// ===== CONSTANTS =====
const STUDENTS_KEY = 'students';
const ATTENDANCE_KEY = 'attendance';
const EXAMS_KEY = 'exams';
const GRADES_KEY = 'grades';

// ===== DOM ELEMENTS =====
const totalStudentsElement = document.getElementById('totalStudents');
const totalSessionsElement = document.getElementById('totalSessions');
const avgAttendanceElement = document.getElementById('avgAttendance');
const warningCountElement = document.getElementById('warningCount');
const statusFilter = document.getElementById('statusFilter');
const sortFilter = document.getElementById('sortFilter');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const reportTableBody = document.getElementById('reportTableBody');
const reportEmptyState = document.getElementById('reportEmptyState');
const warningList = document.getElementById('warningList');
const warningEmptyState = document.getElementById('warningEmptyState');
const exportBtn = document.getElementById('exportBtn');
const printBtn = document.getElementById('printBtn');
const toast = document.getElementById('toast');

// ===== STATE =====
let students = [];
let attendanceRecords = [];
let exams = [];
let grades = {};
let reportData = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    generateReport();
    renderReport();
    renderChart();
    renderWarningList();
    updateStats();
});

// ===== LOAD DATA =====
function loadData() {
    // Load students
    const studentsData = localStorage.getItem(STUDENTS_KEY);
    if (studentsData) {
        try {
            students = JSON.parse(studentsData);
        } catch (error) {
            console.error('Lỗi khi load học viên:', error);
            students = [];
        }
    }

    // Load attendance
    const attendanceData = localStorage.getItem(ATTENDANCE_KEY);
    if (attendanceData) {
        try {
            attendanceRecords = JSON.parse(attendanceData);
        } catch (error) {
            console.error('Lỗi khi load điểm danh:', error);
            attendanceRecords = [];
        }
    }

    // Load exams
    const examsData = localStorage.getItem(EXAMS_KEY);
    if (examsData) {
        try {
            exams = JSON.parse(examsData);
        } catch (error) {
            console.error('Lỗi khi load bài kiểm tra:', error);
            exams = [];
        }
    }

    // Load grades
    const gradesData = localStorage.getItem(GRADES_KEY);
    if (gradesData) {
        try {
            grades = JSON.parse(gradesData);
        } catch (error) {
            console.error('Lỗi khi load điểm:', error);
            grades = {};
        }
    }
}

// ===== GENERATE REPORT =====
function generateReport() {
    reportData = students.map(student => {
        const attendanceStats = calculateStudentStats(student.id);
        const gradeAverage = calculateGradeAverage(student.id);
        const finalScore = calculateFinalScore(attendanceStats.percentage, gradeAverage);
        const status = getStatus(finalScore);
        const note = getNote(attendanceStats, gradeAverage);

        return {
            id: student.id,
            name: student.name,
            zalo: student.zalo,
            gmail: student.gmail,
            total: attendanceStats.total,
            present: attendanceStats.present,
            absent: attendanceStats.absent,
            late: attendanceStats.late,
            percentage: attendanceStats.percentage,
            gradeAverage: gradeAverage,
            finalScore: finalScore,
            status: status,
            note: note
        };
    });
}

// ===== CALCULATE GRADE AVERAGE =====
function calculateGradeAverage(studentId) {
    if (exams.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    exams.forEach(exam => {
        const score = grades[exam.id]?.[studentId];
        if (score !== undefined) {
            totalWeightedScore += score * exam.weight;
            totalWeight += exam.weight;
        }
    });

    return totalWeight > 0 ? parseFloat((totalWeightedScore / totalWeight).toFixed(2)) : 0;
}

// ===== CALCULATE FINAL SCORE =====
function calculateFinalScore(attendancePercentage, gradeAverage) {
    // Công thức: Điểm tổng = (Chuyên cần × 30%) + (Điểm TB × 70%)
    // Chuyên cần được quy đổi sang thang điểm 10
    const attendanceScore = (attendancePercentage / 100) * 10;
    const finalScore = (attendanceScore * 0.3) + (gradeAverage * 0.7);
    return parseFloat(finalScore.toFixed(2));
}

// ===== CALCULATE STATS =====
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

// ===== GET STATUS =====
function getStatus(finalScore) {
    if (finalScore >= 8) return { level: 'excellent', text: 'Xuất sắc' };
    if (finalScore >= 6.5) return { level: 'good', text: 'Khá' };
    if (finalScore >= 5) return { level: 'average', text: 'Trung bình' };
    return { level: 'warning', text: 'Yếu' };
}

// ===== GET NOTE =====
function getNote(attendanceStats, gradeAverage) {
    if (attendanceStats.total === 0 && exams.length === 0) return 'Chưa có dữ liệu';
    if (attendanceStats.percentage < 45) return 'Chuyên cần kém';
    if (gradeAverage > 0 && gradeAverage < 5) return 'Điểm học tập yếu';
    if (attendanceStats.absent > attendanceStats.total * 0.3) return 'Vắng nhiều';
    if (attendanceStats.late > attendanceStats.total * 0.2) return 'Đi trễ nhiều';
    if (attendanceStats.percentage >= 95 && gradeAverage >= 8) return 'Học sinh xuất sắc';
    return '';
}

// ===== RENDER REPORT =====
function renderReport() {
    reportTableBody.innerHTML = '';

    if (reportData.length === 0) {
        reportEmptyState.classList.add('show');
        return;
    }

    reportEmptyState.classList.remove('show');

    // Apply filters
    let filteredData = [...reportData];

    // Status filter
    const statusValue = statusFilter.value;
    if (statusValue !== 'all') {
        filteredData = filteredData.filter(item => item.status.level === statusValue);
    }

    // Sort filter
    const sortValue = sortFilter.value;
    filteredData.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name, 'vi');
            case 'name-desc':
                return b.name.localeCompare(a.name, 'vi');
            case 'attendance-desc':
                return b.finalScore - a.finalScore;
            case 'attendance-asc':
                return a.finalScore - b.finalScore;
            default:
                return 0;
        }
    });

    // Render rows
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${item.total}</td>
            <td><span style="color: #51cf66;">${item.present}</span></td>
            <td><span style="color: #ff4757;">${item.absent}</span></td>
            <td><span style="color: #ffa502;">${item.late}</span></td>
            <td><strong>${item.percentage}%</strong></td>
            <td><strong>${item.gradeAverage}</strong></td>
            <td><strong style="color: #667eea; font-size: 16px;">${item.finalScore}</strong></td>
            <td><span class="status-badge ${item.status.level}">${item.status.text}</span></td>
            <td><span class="note-text">${item.note}</span></td>
        `;
        reportTableBody.appendChild(row);
    });
}

// ===== RENDER CHART =====
function renderChart() {
    const distribution = {
        excellent: 0,
        good: 0,
        average: 0,
        warning: 0
    };

    reportData.forEach(item => {
        distribution[item.status.level]++;
    });

    const total = reportData.length || 1;

    // Update counts
    document.getElementById('countExcellent').textContent = distribution.excellent;
    document.getElementById('countGood').textContent = distribution.good;
    document.getElementById('countAverage').textContent = distribution.average;
    document.getElementById('countWarning').textContent = distribution.warning;

    // Update bar heights with animation
    setTimeout(() => {
        document.getElementById('barExcellent').style.height = 
            `${(distribution.excellent / total) * 100}%`;
        document.getElementById('barGood').style.height = 
            `${(distribution.good / total) * 100}%`;
        document.getElementById('barAverage').style.height = 
            `${(distribution.average / total) * 100}%`;
        document.getElementById('barWarning').style.height = 
            `${(distribution.warning / total) * 100}%`;
    }, 100);
}

// ===== RENDER WARNING LIST =====
function renderWarningList() {
    warningList.innerHTML = '';

    const warningStudents = reportData.filter(item => item.status.level === 'warning');

    if (warningStudents.length === 0) {
        warningEmptyState.classList.add('show');
        warningList.classList.remove('show');
        return;
    }

    warningEmptyState.classList.remove('show');
    warningList.classList.add('show');

    // Sort by finalScore ascending
    warningStudents.sort((a, b) => a.finalScore - b.finalScore);

    warningStudents.forEach(student => {
        const item = document.createElement('div');
        item.className = 'warning-item';
        item.innerHTML = `
            <div class="warning-info">
                <div class="warning-name">${escapeHtml(student.name)}</div>
                <div class="warning-details">
                    📱 ${escapeHtml(student.zalo)} • 
                    📧 ${escapeHtml(student.gmail)} • 
                    Chuyên cần: ${student.percentage}% • 
                    Điểm TB: ${student.gradeAverage} • 
                    Vắng: ${student.absent} buổi
                </div>
            </div>
            <div class="warning-percentage">${student.finalScore}</div>
        `;
        warningList.appendChild(item);
    });
}

// ===== UPDATE STATS =====
function updateStats() {
    totalStudentsElement.textContent = students.length;
    totalSessionsElement.textContent = attendanceRecords.length;

    if (reportData.length === 0) {
        avgAttendanceElement.textContent = '0%';
        warningCountElement.textContent = '0';
        return;
    }

    // Calculate average final score
    const totalFinalScore = reportData.reduce((sum, item) => sum + item.finalScore, 0);
    const avgFinalScore = (totalFinalScore / reportData.length).toFixed(2);
    avgAttendanceElement.textContent = avgFinalScore;

    // Count warnings (students with finalScore < 5)
    const warningCount = reportData.filter(item => item.finalScore < 5).length;
    warningCountElement.textContent = warningCount;
}

// ===== FILTER HANDLER =====
applyFilterBtn.addEventListener('click', () => {
    renderReport();
    showToast('✓ Đã áp dụng bộ lọc!', 'success');
});

// Auto apply on change
statusFilter.addEventListener('change', () => {
    renderReport();
});

sortFilter.addEventListener('change', () => {
    renderReport();
});

// ===== EXPORT TO EXCEL =====
exportBtn.addEventListener('click', () => {
    if (reportData.length === 0) {
        showToast('Không có dữ liệu để xuất!', 'warning');
        return;
    }

    // Create CSV content
    let csv = 'STT,Họ và tên,Zalo,Gmail,Tổng buổi,Có mặt,Vắng,Trễ,% Chuyên cần,Điểm TB,Điểm tổng,Xếp loại,Ghi chú\n';

    reportData.forEach((item, index) => {
        csv += `${index + 1},"${item.name}","${item.zalo}","${item.gmail}",${item.total},${item.present},${item.absent},${item.late},${item.percentage}%,${item.gradeAverage},${item.finalScore},"${item.status.text}","${item.note}"\n`;
    });

    // Create download link
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-chuyen-can-n5k2-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('✓ Đã xuất file Excel!', 'success');
});

// ===== PRINT REPORT =====
printBtn.addEventListener('click', () => {
    if (reportData.length === 0) {
        showToast('Không có dữ liệu để in!', 'warning');
        return;
    }

    window.print();
});

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== CONSOLE INFO =====
console.log('%c📊 Báo cáo Chuyên cần - Lớp N5K2', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cTổng học viên:', students.length, 'color: #666; font-size: 12px;');
console.log('%cTổng buổi học:', attendanceRecords.length, 'color: #666; font-size: 12px;');
