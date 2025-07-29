// Global Data Storage
let attendanceRecords = [];
let students = [];
let scheduleData = [];
let currentDate = new Date();

// Mock Data
const mockStudents = [
    { id: 'STU001', name: 'Alice Johnson', department: 'computer-science', year: '3', email: 'alice@university.edu', phone: '(555) 123-4567', status: 'active', attendance: 92 },
    { id: 'STU002', name: 'Bob Smith', department: 'mathematics', year: '2', email: 'bob@university.edu', phone: '(555) 234-5678', status: 'active', attendance: 88 },
    { id: 'STU003', name: 'Carol Davis', department: 'physics', year: '4', email: 'carol@university.edu', phone: '(555) 345-6789', status: 'active', attendance: 95 },
    { id: 'STU004', name: 'David Wilson', department: 'chemistry', year: '1', email: 'david@university.edu', phone: '(555) 456-7890', status: 'inactive', attendance: 76 },
    { id: 'STU005', name: 'Emma Brown', department: 'biology', year: '3', email: 'emma@university.edu', phone: '(555) 567-8901', status: 'active', attendance: 91 }
];

const mockRecords = [
    {
        id: 1,
        type: 'class',
        title: 'Advanced Algorithms',
        department: 'computer-science',
        date: '2024-01-15',
        timeIn: '09:00',
        timeOut: '10:30',
        studentsPresent: 28,
        totalStudents: 32,
        attendanceRate: 87.5
    },
    {
        id: 2,
        type: 'event',
        title: 'Science Fair 2024',
        department: 'physics',
        date: '2024-01-14',
        timeIn: '10:00',
        timeOut: '16:00',
        studentsPresent: 156,
        totalStudents: 180,
        attendanceRate: 86.7
    },
    {
        id: 3,
        type: 'other',
        title: 'Student Assembly',
        department: 'general',
        date: '2024-01-13',
        timeIn: '14:00',
        timeOut: '15:30',
        studentsPresent: 245,
        totalStudents: 280,
        attendanceRate: 87.5
    }
];

const mockSchedule = [
    {
        id: 1,
        type: 'class',
        title: 'Database Systems',
        time: '09:00 - 10:30',
        location: 'Room 205',
        instructor: 'Dr. Smith',
        students: 30,
        department: 'computer-science'
    },
    {
        id: 2,
        type: 'event',
        title: 'Tech Conference',
        time: '14:00 - 17:00',
        location: 'Main Auditorium',
        instructor: 'Various Speakers',
        students: 150,
        department: 'computer-science'
    }
];

// Initialize data
students = [...mockStudents];
attendanceRecords = [...mockRecords];
scheduleData = [...mockSchedule];

// Utility Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
}

function getAttendanceColor(rate) {
    if (rate >= 90) return 'attendance-high';
    if (rate >= 75) return 'attendance-medium';
    return 'attendance-low';
}

function getTypeBadge(type) {
    const badges = {
        'class': 'badge-class',
        'event': 'badge-event',
        'other': 'badge-other'
    };
    return badges[type] || 'badge-other';
}

function getStatusBadge(status) {
    const badges = {
        'active': 'badge-active',
        'inactive': 'badge-inactive'
    };
    return badges[status] || 'badge-inactive';
}

// Page-specific initialization
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initDashboard();
            break;
        case 'attendance':
            initAttendancePage();
            break;
        case 'records':
            initRecordsPage();
            break;
        case 'students':
            initStudentsPage();
            break;
        case 'schedule':
            initSchedulePage();
            break;
    }
});

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page === '' ? 'index' : page;
}

// Dashboard Functions
function initDashboard() {
    populateRecentActivity();
    updateDashboardStats();
}

function populateRecentActivity() {
    const activities = [
        { icon: 'fas fa-clipboard-check', title: 'Advanced Algorithms - Class attendance recorded', time: '2 hours ago' },
        { icon: 'fas fa-user-plus', title: 'New student Emma Brown added to system', time: '3 hours ago' },
        { icon: 'fas fa-calendar-plus', title: 'Science Fair 2024 scheduled', time: '5 hours ago' },
        { icon: 'fas fa-chart-line', title: 'Monthly attendance report generated', time: '1 day ago' }
    ];

    const activityList = document.getElementById('recentActivity');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function updateDashboardStats() {
    const totalSessions = document.getElementById('totalSessions');
    const totalStudents = document.getElementById('totalStudents');
    const avgAttendance = document.getElementById('avgAttendance');
    const totalDepartments = document.getElementById('totalDepartments');

    if (totalSessions) totalSessions.textContent = attendanceRecords.length;
    if (totalStudents) totalStudents.textContent = students.filter(s => s.status === 'active').length;
    if (avgAttendance) {
        const avg = attendanceRecords.reduce((sum, record) => sum + record.attendanceRate, 0) / attendanceRecords.length;
        avgAttendance.textContent = Math.round(avg) + '%';
    }
    if (totalDepartments) {
        const departments = new Set(students.map(s => s.department));
        totalDepartments.textContent = departments.size;
    }
}

// Attendance Page Functions
function initAttendancePage() {
    const attendanceTypeSelect = document.getElementById('attendanceType');
    const dateInput = document.getElementById('date');
    const timeInInput = document.getElementById('timeIn');
    const attendanceForm = document.getElementById('attendanceForm');
    const previewBtn = document.getElementById('previewBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const studentSearch = document.getElementById('studentSearch');

    // Set default date to today
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Set default time
    if (timeInInput) {
        const now = new Date();
        timeInInput.value = now.toTimeString().slice(0, 5);
    }

    // Handle attendance type change
    if (attendanceTypeSelect) {
        attendanceTypeSelect.addEventListener('change', function() {
            toggleConditionalFields(this.value);
        });
    }

    // Populate student list
    populateStudentList();

    // Handle student search
    if (studentSearch) {
        studentSearch.addEventListener('input', function() {
            filterStudents(this.value);
        });
    }

    // Handle select all
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            toggleSelectAllStudents();
        });
    }

    // Handle form submission
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAttendance();
        });
    }

    // Handle preview
    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }

    // Handle modal
    setupModal();
}

function toggleConditionalFields(type) {
    const classFields = document.getElementById('classFields');
    const eventFields = document.getElementById('eventFields');

    if (classFields) classFields.style.display = type === 'class' ? 'block' : 'none';
    if (eventFields) eventFields.style.display = type === 'event' ? 'block' : 'none';
}

function populateStudentList() {
    const studentList = document.getElementById('studentList');
    if (!studentList) return;

    studentList.innerHTML = students.map(student => `
        <div class="student-item">
            <input type="checkbox" id="student-${student.id}" value="${student.id}">
            <label for="student-${student.id}">${student.name} (${student.id}) - ${student.department}</label>
        </div>
    `).join('');
}

function filterStudents(searchTerm) {
    const studentItems = document.querySelectorAll('.student-item');
    const term = searchTerm.toLowerCase();

    studentItems.forEach(item => {
        const label = item.querySelector('label').textContent.toLowerCase();
        item.style.display = label.includes(term) ? 'flex' : 'none';
    });
}

function toggleSelectAllStudents() {
    const checkboxes = document.querySelectorAll('#studentList input[type="checkbox"]');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });

    selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
}

function showPreview() {
    const formData = collectFormData();
    const previewContent = document.getElementById('previewContent');
    const previewModal = document.getElementById('previewModal');

    if (previewContent && previewModal) {
        previewContent.innerHTML = generatePreviewHTML(formData);
        previewModal.classList.add('show');
    }
}

function collectFormData() {
    const selectedStudents = Array.from(document.querySelectorAll('#studentList input[type="checkbox"]:checked'))
        .map(cb => students.find(s => s.id === cb.value))
        .filter(Boolean);

    return {
        type: document.getElementById('attendanceType')?.value,
        title: document.getElementById('title')?.value,
        department: document.getElementById('department')?.value,
        year: document.getElementById('year')?.value,
        section: document.getElementById('section')?.value,
        subject: document.getElementById('subject')?.value,
        eventType: document.getElementById('eventType')?.value,
        venue: document.getElementById('venue')?.value,
        date: document.getElementById('date')?.value,
        timeIn: document.getElementById('timeIn')?.value,
        timeOut: document.getElementById('timeOut')?.value,
        description: document.getElementById('description')?.value,
        selectedStudents
    };
}

function generatePreviewHTML(data) {
    return `
        <div class="preview-section">
            <h4>Attendance Details</h4>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Department:</strong> ${data.department}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.timeIn} - ${data.timeOut || 'Ongoing'}</p>
            ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
        </div>
        <div class="preview-section">
            <h4>Students Present (${data.selectedStudents.length})</h4>
            <ul>
                ${data.selectedStudents.map(s => `<li>${s.name} (${s.id})</li>`).join('')}
            </ul>
        </div>
    `;
}

function saveAttendance() {
    const formData = collectFormData();
    
    const newRecord = {
        id: Date.now(),
        type: formData.type,
        title: formData.title,
        department: formData.department,
        date: formData.date,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        studentsPresent: formData.selectedStudents.length,
        totalStudents: students.filter(s => s.department === formData.department).length,
        attendanceRate: Math.round((formData.selectedStudents.length / students.filter(s => s.department === formData.department).length) * 100)
    };

    attendanceRecords.unshift(newRecord);
    alert('Attendance recorded successfully!');
    
    // Reset form
    document.getElementById('attendanceForm').reset();
    populateStudentList();
}

function setupModal() {
    const modal = document.getElementById('previewModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    const confirmBtn = document.getElementById('confirmSave');

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            saveAttendance();
        });
    }

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// Records Page Functions
function initRecordsPage() {
    populateRecords();
    updateRecordsStats();
    setupRecordsFilters();
    setupExport();
}

function populateRecords() {
    const recordsList = document.getElementById('recordsList');
    if (!recordsList) return;

    recordsList.innerHTML = attendanceRecords.map(record => `
        <div class="record-item">
            <div class="record-header">
                <div>
                    <div class="record-title">${record.title}</div>
                    <div class="record-meta">
                        <span class="badge ${getTypeBadge(record.type)}">${record.type}</span>
                        <span><i class="fas fa-building"></i> ${record.department}</span>
                        <span><i class="fas fa-calendar"></i> ${record.date}</span>
                        <span><i class="fas fa-clock"></i> ${record.timeIn} - ${record.timeOut || 'Ongoing'}</span>
                    </div>
                </div>
            </div>
            <div class="record-stats">
                <div class="record-stat">
                    <div class="record-stat-value">${record.studentsPresent}</div>
                    <div class="record-stat-label">Present</div>
                </div>
                <div class="record-stat">
                    <div class="record-stat-value">${record.totalStudents}</div>
                    <div class="record-stat-label">Total</div>
                </div>
                <div class="record-stat">
                    <div class="record-stat-value ${getAttendanceColor(record.attendanceRate)}">${record.attendanceRate}%</div>
                    <div class="record-stat-label">Attendance</div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateRecordsStats() {
    const totalRecords = document.getElementById('totalRecords');
    const avgAttendanceRate = document.getElementById('avgAttendanceRate');
    const studentsTracked = document.getElementById('studentsTracked');

    if (totalRecords) totalRecords.textContent = attendanceRecords.length;
    
    if (avgAttendanceRate && attendanceRecords.length > 0) {
        const avg = attendanceRecords.reduce((sum, record) => sum + record.attendanceRate, 0) / attendanceRecords.length;
        avgAttendanceRate.textContent = Math.round(avg) + '%';
    }
    
    if (studentsTracked) {
        const tracked = new Set();
        attendanceRecords.forEach(record => {
            // In a real app, you'd have the actual student IDs per record
            tracked.add(record.department);
        });
        studentsTracked.textContent = students.length;
    }
}

function setupRecordsFilters() {
    const searchFilter = document.getElementById('searchFilter');
    const typeFilter = document.getElementById('typeFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const clearFilters = document.getElementById('clearFilters');

    [searchFilter, typeFilter, departmentFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyRecordsFilters);
        }
    });

    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            [searchFilter, typeFilter, departmentFilter].forEach(filter => {
                if (filter) filter.value = '';
            });
            populateRecords();
        });
    }
}

function applyRecordsFilters() {
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const departmentFilter = document.getElementById('departmentFilter')?.value || '';

    const filtered = attendanceRecords.filter(record => {
        const matchesSearch = record.title.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || record.type === typeFilter;
        const matchesDepartment = !departmentFilter || record.department === departmentFilter;
        
        return matchesSearch && matchesType && matchesDepartment;
    });

    const recordsList = document.getElementById('recordsList');
    if (recordsList) {
        recordsList.innerHTML = filtered.map(record => `
            <div class="record-item">
                <div class="record-header">
                    <div>
                        <div class="record-title">${record.title}</div>
                        <div class="record-meta">
                            <span class="badge ${getTypeBadge(record.type)}">${record.type}</span>
                            <span><i class="fas fa-building"></i> ${record.department}</span>
                            <span><i class="fas fa-calendar"></i> ${record.date}</span>
                            <span><i class="fas fa-clock"></i> ${record.timeIn} - ${record.timeOut || 'Ongoing'}</span>
                        </div>
                    </div>
                </div>
                <div class="record-stats">
                    <div class="record-stat">
                        <div class="record-stat-value">${record.studentsPresent}</div>
                        <div class="record-stat-label">Present</div>
                    </div>
                    <div class="record-stat">
                        <div class="record-stat-value">${record.totalStudents}</div>
                        <div class="record-stat-label">Total</div>
                    </div>
                    <div class="record-stat">
                        <div class="record-stat-value ${getAttendanceColor(record.attendanceRate)}">${record.attendanceRate}%</div>
                        <div class="record-stat-label">Attendance</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function setupExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('Export functionality would be implemented here');
        });
    }
}

// Students Page Functions
function initStudentsPage() {
    populateStudents();
    updateStudentsStats();
    setupStudentsFilters();
    setupAddStudent();
}

function populateStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;

    studentsGrid.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">${getInitials(student.name)}</div>
                <div>
                    <div class="student-name">${student.name}</div>
                    <div class="student-id">${student.id}</div>
                </div>
            </div>
            <div class="student-details">
                <div class="student-detail">
                    <i class="fas fa-building"></i>
                    <span>${student.department}</span>
                </div>
                <div class="student-detail">
                    <i class="fas fa-graduation-cap"></i>
                    <span>Year ${student.year}</span>
                </div>
                <div class="student-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${student.email}</span>
                </div>
                <div class="student-detail">
                    <i class="fas fa-phone"></i>
                    <span>${student.phone}</span>
                </div>
                <div class="student-detail">
                    <span class="badge ${getStatusBadge(student.status)}">${student.status}</span>
                </div>
            </div>
            <div class="student-attendance">
                <div class="attendance-rate ${getAttendanceColor(student.attendance)}">${student.attendance}%</div>
                <div>Attendance Rate</div>
            </div>
        </div>
    `).join('');
}

function updateStudentsStats() {
    const totalStudentsCount = document.getElementById('totalStudentsCount');
    const activeStudentsCount = document.getElementById('activeStudentsCount');
    const avgStudentAttendance = document.getElementById('avgStudentAttendance');
    const departmentsCount = document.getElementById('departmentsCount');

    if (totalStudentsCount) totalStudentsCount.textContent = students.length;
    
    if (activeStudentsCount) {
        activeStudentsCount.textContent = students.filter(s => s.status === 'active').length;
    }
    
    if (avgStudentAttendance && students.length > 0) {
        const avg = students.reduce((sum, student) => sum + student.attendance, 0) / students.length;
        avgStudentAttendance.textContent = Math.round(avg) + '%';
    }
    
    if (departmentsCount) {
        const departments = new Set(students.map(s => s.department));
        departmentsCount.textContent = departments.size;
    }
}

function setupStudentsFilters() {
    const searchStudents = document.getElementById('searchStudents');
    const departmentFilter = document.getElementById('departmentFilterStudents');
    const yearFilter = document.getElementById('yearFilterStudents');
    const statusFilter = document.getElementById('statusFilterStudents');

    [searchStudents, departmentFilter, yearFilter, statusFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('input', applyStudentsFilters);
            filter.addEventListener('change', applyStudentsFilters);
        }
    });
}

function applyStudentsFilters() {
    const searchTerm = document.getElementById('searchStudents')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('departmentFilterStudents')?.value || '';
    const yearFilter = document.getElementById('yearFilterStudents')?.value || '';
    const statusFilter = document.getElementById('statusFilterStudents')?.value || '';

    const filtered = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                             student.id.toLowerCase().includes(searchTerm);
        const matchesDepartment = !departmentFilter || student.department === departmentFilter;
        const matchesYear = !yearFilter || student.year === yearFilter;
        const matchesStatus = !statusFilter || student.status === statusFilter;
        
        return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
    });

    const studentsGrid = document.getElementById('studentsGrid');
    if (studentsGrid) {
        studentsGrid.innerHTML = filtered.map(student => `
            <div class="student-card">
                <div class="student-header">
                    <div class="student-avatar">${getInitials(student.name)}</div>
                    <div>
                        <div class="student-name">${student.name}</div>
                        <div class="student-id">${student.id}</div>
                    </div>
                </div>
                <div class="student-details">
                    <div class="student-detail">
                        <i class="fas fa-building"></i>
                        <span>${student.department}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Year ${student.year}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${student.email}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-phone"></i>
                        <span>${student.phone}</span>
                    </div>
                    <div class="student-detail">
                        <span class="badge ${getStatusBadge(student.status)}">${student.status}</span>
                    </div>
                </div>
                <div class="student-attendance">
                    <div class="attendance-rate ${getAttendanceColor(student.attendance)}">${student.attendance}%</div>
                    <div>Attendance Rate</div>
                </div>
            </div>
        `).join('');
    }
}

function setupAddStudent() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addStudentModal = document.getElementById('addStudentModal');
    const closeButtons = addStudentModal?.querySelectorAll('.modal-close');
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    const addStudentForm = document.getElementById('addStudentForm');

    if (addStudentBtn && addStudentModal) {
        addStudentBtn.addEventListener('click', () => {
            addStudentModal.classList.add('show');
        });
    }

    closeButtons?.forEach(btn => {
        btn.addEventListener('click', () => {
            addStudentModal.classList.remove('show');
        });
    });

    if (saveStudentBtn && addStudentForm) {
        saveStudentBtn.addEventListener('click', () => {
            const formData = new FormData(addStudentForm);
            const newStudent = {
                id: 'STU' + String(students.length + 1).padStart(3, '0'),
                name: document.getElementById('studentName').value,
                department: document.getElementById('studentDepartment').value,
                year: document.getElementById('studentYear').value,
                email: document.getElementById('studentEmail').value,
                phone: document.getElementById('studentPhone').value,
                status: 'active',
                attendance: Math.floor(Math.random() * 20 + 80) // Random attendance between 80-100
            };

            students.push(newStudent);
            populateStudents();
            updateStudentsStats();
            addStudentModal.classList.remove('show');
            addStudentForm.reset();
            alert('Student added successfully!');
        });
    }

    // Close on backdrop click
    addStudentModal?.addEventListener('click', (e) => {
        if (e.target === addStudentModal) {
            addStudentModal.classList.remove('show');
        }
    });
}

// Schedule Page Functions
function initSchedulePage() {
    updateCurrentDate();
    populateSchedule();
    populateWeeklyOverview();
    updateScheduleStats();
    setupDateNavigation();
}

function updateCurrentDate() {
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    if (currentDateDisplay) {
        currentDateDisplay.textContent = formatDate(currentDate);
    }
}

function populateSchedule() {
    const todaySchedule = document.getElementById('todaySchedule');
    if (!todaySchedule) return;

    todaySchedule.innerHTML = scheduleData.map(session => `
        <div class="schedule-item">
            <div class="schedule-header">
                <div>
                    <div class="schedule-title">${session.title}</div>
                    <span class="badge ${getTypeBadge(session.type)}">${session.type}</span>
                </div>
            </div>
            <div class="schedule-details">
                <div><i class="fas fa-clock"></i> ${session.time}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${session.location}</div>
                <div><i class="fas fa-user"></i> ${session.instructor}</div>
                <div><i class="fas fa-users"></i> ${session.students} students</div>
                <div><i class="fas fa-building"></i> ${session.department}</div>
            </div>
        </div>
    `).join('');
}

function populateWeeklyOverview() {
    const weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = currentDate.getDay();

    weekGrid.innerHTML = days.map((day, index) => `
        <div class="week-day ${index === today ? 'current' : ''}">
            <div class="week-day-name">${day}</div>
            <div class="week-day-count">${Math.floor(Math.random() * 8 + 2)}</div>
        </div>
    `).join('');
}

function updateScheduleStats() {
    const sessionsToday = document.getElementById('sessionsToday');
    const classesToday = document.getElementById('classesToday');
    const eventsToday = document.getElementById('eventsToday');
    const activitiesCount = document.getElementById('activitiesCount');

    if (sessionsToday) sessionsToday.textContent = scheduleData.length;
    if (classesToday) classesToday.textContent = scheduleData.filter(s => s.type === 'class').length;
    if (eventsToday) eventsToday.textContent = scheduleData.filter(s => s.type === 'event').length;
    if (activitiesCount) activitiesCount.textContent = scheduleData.filter(s => s.type === 'other').length;
}

function setupDateNavigation() {
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');

    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateCurrentDate();
            populateWeeklyOverview();
        });
    }

    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateCurrentDate();
            populateWeeklyOverview();
        });
    }
}