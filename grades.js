// ===== CONSTANTS =====
const STUDENTS_KEY = 'students';
const EXAMS_KEY = 'exams';
const GRADES_KEY = 'grades';

// ===== DOM ELEMENTS =====
const examForm = document.getElementById('examForm');
const examNameInput = document.getElementById('examName');
const examDateInput = document.getElementById('examDate');
const examWeightInput = document.getElementById('examWeight');
const examsList = document.getElementById('examsList');
const examsEmptyState = document.getElementById('examsEmptyState');
const clearExamsBtn = document.getElementById('clearExamsBtn');
const gradeInputSection = document.getElementById('gradeInputSection');
const gradeInputTitle = document.getElementById('gradeInputTitle');
const gradeInputList = document.getElementById('gradeInputList');
const closeGradeInputBtn = document.getElementById('closeGradeInputBtn');
const saveGradesBtn = document.getElementById('saveGradesBtn');
const gradesTableHead = document.getElementById('gradesTableHead');
const gradesTableBody = document.getElementById('gradesTableBody');
const gradesEmptyState = document.getElementById('gradesEmptyState');
const exportGradesBtn = document.getElementById('exportGradesBtn');
const printGradesBtn = document.getElementById('printGradesBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const toast = document.getElementById('toast');

// Stats elements
const totalExamsElement = document.getElementById('totalExams');
const classAverageElement = document.getElementById('classAverage');
const highestScoreElement = document.getElementById('highestScore');
const lowestScoreElement = document.getElementById('lowestScore');

// ===== STATE =====
let students = [];
let exams = [];
let grades = {}; // { examId: { studentId: score } }
let currentExamId = null;
let confirmAction = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    examDateInput.value = new Date().toISOString().split('T')[0];
    loadData();
    renderExams();
    renderGradesTable();
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

// ===== SAVE DATA =====
function saveExams() {
    try {
        localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
    } catch (error) {
        console.error('Lỗi khi lưu bài kiểm tra:', error);
        showToast('Lỗi khi lưu dữ liệu!', 'error');
    }
}

function saveGrades() {
    try {
        localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    } catch (error) {
        console.error('Lỗi khi lưu điểm:', error);
        showToast('Lỗi khi lưu dữ liệu!', 'error');
    }
}

// ===== EXAM FORM =====
examForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = examNameInput.value.trim();
    const date = examDateInput.value;
    const weight = parseInt(examWeightInput.value);

    if (!name || !date || !weight) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
        return;
    }

    const newExam = {
        id: Date.now(),
        name: name,
        date: date,
        weight: weight,
        createdAt: new Date().toISOString()
    };

    exams.push(newExam);
    exams.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Initialize grades for this exam
    grades[newExam.id] = {};

    saveExams();
    saveGrades();
    renderExams();
    renderGradesTable();
    updateStats();

    examForm.reset();
    examDateInput.value = new Date().toISOString().split('T')[0];
    examWeightInput.value = 1;

    showToast(`✓ Đã thêm bài kiểm tra: ${name}`, 'success');
});

// ===== RENDER EXAMS =====
function renderExams() {
    examsList.innerHTML = '';

    if (exams.length === 0) {
        examsEmptyState.classList.add('show');
        examsList.classList.remove('show');
        return;
    }

    examsEmptyState.classList.remove('show');
    examsList.classList.add('show');

    exams.forEach(exam => {
        const item = document.createElement('div');
        item.className = 'exam-item';
        item.innerHTML = `
            <div class="exam-info">
                <div class="exam-name">
                    ${escapeHtml(exam.name)}
                    <span class="exam-weight">×${exam.weight}</span>
                </div>
                <div class="exam-details">
                    📅 ${formatDate(exam.date)} • 
                    ${getGradedCount(exam.id)}/${students.length} học viên đã có điểm
                </div>
            </div>
            <div class="exam-actions">
                <button class="btn btn-primary btn-small" onclick="openGradeInput(${exam.id})">
                    📝 Nhập điểm
                </button>
                <button class="btn btn-warning btn-small" onclick="editExam(${exam.id})">
                    ✏️ Sửa
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteExam(${exam.id})">
                    🗑️ Xóa
                </button>
            </div>
        `;
        examsList.appendChild(item);
    });
}

// ===== GET GRADED COUNT =====
function getGradedCount(examId) {
    if (!grades[examId]) return 0;
    return Object.keys(grades[examId]).length;
}

// ===== OPEN GRADE INPUT =====
window.openGradeInput = function(examId) {
    if (students.length === 0) {
        showToast('Chưa có học viên nào trong hệ thống!', 'warning');
        return;
    }

    currentExamId = examId;
    const exam = exams.find(e => e.id === examId);

    gradeInputTitle.textContent = `📝 Nhập điểm: ${exam.name}`;
    gradeInputList.innerHTML = '';

    students.forEach(student => {
        const currentGrade = grades[examId]?.[student.id] || '';

        const item = document.createElement('div');
        item.className = 'grade-input-item';
        item.innerHTML = `
            <div class="student-name-grade">${escapeHtml(student.name)}</div>
            <input 
                type="number" 
                class="grade-input-field" 
                data-student-id="${student.id}"
                value="${currentGrade}"
                min="0"
                max="10"
                step="0.25"
                placeholder="0-10"
            >
        `;
        gradeInputList.appendChild(item);
    });

    // Add input event listeners
    document.querySelectorAll('.grade-input-field').forEach(input => {
        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value >= 8) {
                e.target.className = 'grade-input-field excellent';
            } else if (value >= 6.5) {
                e.target.className = 'grade-input-field good';
            } else if (value >= 5) {
                e.target.className = 'grade-input-field average';
            } else if (value > 0) {
                e.target.className = 'grade-input-field poor';
            } else {
                e.target.className = 'grade-input-field';
            }
        });
    });

    gradeInputSection.style.display = 'block';
    gradeInputSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== CLOSE GRADE INPUT =====
closeGradeInputBtn.addEventListener('click', () => {
    gradeInputSection.style.display = 'none';
    currentExamId = null;
});

// ===== SAVE GRADES =====
saveGradesBtn.addEventListener('click', () => {
    if (!currentExamId) return;

    if (!grades[currentExamId]) {
        grades[currentExamId] = {};
    }

    const inputs = document.querySelectorAll('.grade-input-field');
    let count = 0;

    inputs.forEach(input => {
        const studentId = parseInt(input.dataset.studentId);
        const score = input.value.trim();

        if (score !== '') {
            const scoreValue = parseFloat(score);
            if (scoreValue >= 0 && scoreValue <= 10) {
                grades[currentExamId][studentId] = scoreValue;
                count++;
            }
        } else {
            delete grades[currentExamId][studentId];
        }
    });

    saveGrades();
    renderExams();
    renderGradesTable();
    updateStats();

    gradeInputSection.style.display = 'none';
    currentExamId = null;

    showToast(`✓ Đã lưu điểm cho ${count} học viên!`, 'success');
});

// ===== EDIT EXAM =====
window.editExam = function(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    examNameInput.value = exam.name;
    examDateInput.value = exam.date;
    examWeightInput.value = exam.weight;

    // Delete old exam
    deleteExam(examId, true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Đã tải thông tin để chỉnh sửa!', 'success');
}

// ===== DELETE EXAM =====
window.deleteExam = function(examId, silent = false) {
    if (!silent) {
        confirmAction = () => {
            const index = exams.findIndex(e => e.id === examId);
            if (index !== -1) {
                const examName = exams[index].name;
                exams.splice(index, 1);
                delete grades[examId];
                saveExams();
                saveGrades();
                renderExams();
                renderGradesTable();
                updateStats();
                showToast(`✓ Đã xóa bài kiểm tra: ${examName}`, 'success');
            }
        };

        const exam = exams.find(e => e.id === examId);
        document.getElementById('confirmMessage').textContent =
            `Bạn có chắc chắn muốn xóa bài kiểm tra "${exam.name}"? Điểm số sẽ bị xóa!`;
        confirmModal.classList.add('show');
    } else {
        const index = exams.findIndex(e => e.id === examId);
        if (index !== -1) {
            exams.splice(index, 1);
            delete grades[examId];
            saveExams();
            saveGrades();
        }
    }
}

// ===== CLEAR ALL EXAMS =====
clearExamsBtn.addEventListener('click', () => {
    if (exams.length === 0) {
        showToast('Danh sách đã trống!', 'warning');
        return;
    }

    confirmAction = () => {
        exams = [];
        grades = {};
        saveExams();
        saveGrades();
        renderExams();
        renderGradesTable();
        updateStats();
        showToast('✓ Đã xóa tất cả bài kiểm tra!', 'success');
    };

    document.getElementById('confirmMessage').textContent =
        `Bạn có chắc chắn muốn xóa TẤT CẢ ${exams.length} bài kiểm tra? Toàn bộ điểm số sẽ bị xóa!`;
    confirmModal.classList.add('show');
});

// ===== RENDER GRADES TABLE =====
function renderGradesTable() {
    // Render header
    let headerHTML = '<tr><th>Họ và tên</th>';
    exams.forEach(exam => {
        headerHTML += `<th>${escapeHtml(exam.name)}<br><small>(×${exam.weight})</small></th>`;
    });
    headerHTML += '<th>Điểm TB</th><th>Xếp loại</th></tr>';
    gradesTableHead.innerHTML = headerHTML;

    // Render body
    gradesTableBody.innerHTML = '';

    if (students.length === 0 || exams.length === 0) {
        gradesEmptyState.classList.add('show');
        return;
    }

    gradesEmptyState.classList.remove('show');

    students.forEach(student => {
        const row = document.createElement('tr');
        let rowHTML = `<td>${escapeHtml(student.name)}</td>`;

        // Render grades for each exam
        let totalWeightedScore = 0;
        let totalWeight = 0;

        exams.forEach(exam => {
            const score = grades[exam.id]?.[student.id];
            if (score !== undefined) {
                const gradeClass = getGradeClass(score);
                rowHTML += `<td><span class="grade-cell ${gradeClass}">${score}</span></td>`;
                totalWeightedScore += score * exam.weight;
                totalWeight += exam.weight;
            } else {
                rowHTML += `<td><span class="grade-cell empty">-</span></td>`;
            }
        });

        // Calculate average
        const average = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 0;
        const avgClass = getGradeClass(average);
        rowHTML += `<td><span class="average-cell grade-cell ${avgClass}">${average}</span></td>`;

        // Render grade badge
        const badge = getGradeBadge(average);
        rowHTML += `<td><span class="grade-badge ${badge.class}">${badge.text}</span></td>`;

        row.innerHTML = rowHTML;
        gradesTableBody.appendChild(row);
    });
}

// ===== GET GRADE CLASS =====
function getGradeClass(score) {
    if (score >= 8) return 'excellent';
    if (score >= 6.5) return 'good';
    if (score >= 5) return 'average';
    if (score > 0) return 'poor';
    return 'empty';
}

// ===== GET GRADE BADGE =====
function getGradeBadge(average) {
    if (average >= 8) return { class: 'excellent', text: 'Giỏi' };
    if (average >= 6.5) return { class: 'good', text: 'Khá' };
    if (average >= 5) return { class: 'average', text: 'Trung bình' };
    if (average > 0) return { class: 'poor', text: 'Yếu' };
    return { class: 'empty', text: 'Chưa có điểm' };
}

// ===== UPDATE STATS =====
function updateStats() {
    totalExamsElement.textContent = exams.length;

    if (students.length === 0 || exams.length === 0) {
        classAverageElement.textContent = '0';
        highestScoreElement.textContent = '0';
        lowestScoreElement.textContent = '0';
        return;
    }

    let allAverages = [];
    let allScores = [];

    students.forEach(student => {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        exams.forEach(exam => {
            const score = grades[exam.id]?.[student.id];
            if (score !== undefined) {
                totalWeightedScore += score * exam.weight;
                totalWeight += exam.weight;
                allScores.push(score);
            }
        });

        if (totalWeight > 0) {
            allAverages.push(totalWeightedScore / totalWeight);
        }
    });

    if (allAverages.length > 0) {
        const classAvg = (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(2);
        classAverageElement.textContent = classAvg;
    } else {
        classAverageElement.textContent = '0';
    }

    if (allScores.length > 0) {
        highestScoreElement.textContent = Math.max(...allScores).toFixed(2);
        lowestScoreElement.textContent = Math.min(...allScores).toFixed(2);
    } else {
        highestScoreElement.textContent = '0';
        lowestScoreElement.textContent = '0';
    }
}

// ===== EXPORT GRADES =====
exportGradesBtn.addEventListener('click', () => {
    if (students.length === 0 || exams.length === 0) {
        showToast('Không có dữ liệu để xuất!', 'warning');
        return;
    }

    let csv = 'Họ và tên';
    exams.forEach(exam => {
        csv += `,${exam.name} (×${exam.weight})`;
    });
    csv += ',Điểm TB,Xếp loại\n';

    students.forEach(student => {
        csv += `"${student.name}"`;

        let totalWeightedScore = 0;
        let totalWeight = 0;

        exams.forEach(exam => {
            const score = grades[exam.id]?.[student.id];
            if (score !== undefined) {
                csv += `,${score}`;
                totalWeightedScore += score * exam.weight;
                totalWeight += exam.weight;
            } else {
                csv += ',-';
            }
        });

        const average = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 0;
        const badge = getGradeBadge(average);
        csv += `,${average},"${badge.text}"\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bang-diem-n5k2-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('✓ Đã xuất bảng điểm!', 'success');
});

// ===== PRINT GRADES =====
printGradesBtn.addEventListener('click', () => {
    if (students.length === 0 || exams.length === 0) {
        showToast('Không có dữ liệu để in!', 'warning');
        return;
    }

    window.print();
});

// ===== MODAL =====
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
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (confirmModal.classList.contains('show')) {
            confirmAction = null;
            confirmModal.classList.remove('show');
        } else if (gradeInputSection.style.display === 'block') {
            gradeInputSection.style.display = 'none';
            currentExamId = null;
        }
    }
});

// ===== CONSOLE INFO =====
console.log('%c📝 Bảng điểm - Lớp N5K2', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cTổng bài kiểm tra:', exams.length, 'color: #666; font-size: 12px;');
