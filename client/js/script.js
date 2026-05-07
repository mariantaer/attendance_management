// ======================================
// API URL
// ======================================
const API = "http://localhost:3000";

// ======================================
// LOGIN
// ======================================
function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    })
    .then(res => res.json())
    .then(user => {

        if (user.error) {
            alert(user.error);
            return;
        }

        // SAVE USER
        localStorage.setItem("user", JSON.stringify(user));

        // REDIRECT BASED ON ROLE
        if (user.role === "admin") {
            window.location.href = "admin-dashboard.html";
        } else if (user.role === "teacher") {
            window.location.href = "teacher-dashboard.html";
        } else {
            alert("Invalid user role");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Login failed");
    });
}

// ======================================
// LOAD STUDENTS
// ======================================
function loadStudents() {

    fetch(`${API}/teacher/students`)
    .then(res => res.json())
    .then(data => {

        let html = `
            <h2>📋 Student List</h2>
        `;

        if (data.length === 0) {
            html += `<p>No students found.</p>`;
        }

        data.forEach(student => {

            html += `
                <div class="card">
                    <p><strong>${student.name}</strong></p>
                    <p>Class: ${student.class || "N/A"}</p>
                </div>
            `;
        });

        document.getElementById("studentsSection").innerHTML = html;

        // CLEAR OTHER SECTIONS
        document.getElementById("attendanceSection").innerHTML = "";
        document.getElementById("reportsSection").innerHTML = "";
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load students");
    });
}

// ======================================
// SHOW ATTENDANCE
// ======================================
function showAttendance() {

    fetch(`${API}/teacher/students`)
    .then(res => res.json())
    .then(data => {

        let html = `
            <h2>📝 Mark Attendance</h2>
        `;

        if (data.length === 0) {
            html += `<p>No students available.</p>`;
        }

        data.forEach(student => {

            html += `
                <div class="card">
                    <p><strong>${student.name}</strong></p>

                    <button onclick="mark(${student.id}, 'Present')">
                        ✅ Present
                    </button>

                    <button onclick="mark(${student.id}, 'Absent')">
                        ❌ Absent
                    </button>

                    <button onclick="mark(${student.id}, 'Late')">
                        ⏰ Late
                    </button>
                </div>
            `;
        });

        document.getElementById("attendanceSection").innerHTML = html;

        // CLEAR OTHER SECTIONS
        document.getElementById("studentsSection").innerHTML = "";
        document.getElementById("reportsSection").innerHTML = "";
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load attendance");
    });
}

// ======================================
// MARK ATTENDANCE
// ======================================
function mark(studentId, status) {

    fetch(`${API}/attendance/mark`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            student_id: studentId,
            status: status
        })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
    })
    .catch(err => {
        console.error(err);
        alert("Failed to mark attendance");
    });
}

// ======================================
// VIEW REPORTS
// ======================================
function viewReports() {

    fetch(`${API}/attendance/reports`)
    .then(res => res.json())
    .then(data => {

        let html = `
            <h2>📊 Attendance Reports</h2>
        `;

        if (data.length === 0) {
            html += `<p>No reports found.</p>`;
        }

        data.forEach(report => {

            html += `
                <div class="card">
                    <p><strong>Student ID:</strong> ${report.student_id}</p>
                    <p><strong>Status:</strong> ${report.status}</p>
                    <p><strong>Date:</strong> ${report.date}</p>
                </div>
            `;
        });

        document.getElementById("reportsSection").innerHTML = html;

        // CLEAR OTHER SECTIONS
        document.getElementById("studentsSection").innerHTML = "";
        document.getElementById("attendanceSection").innerHTML = "";
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load reports");
    });
}

// ======================================
// LOAD TEACHERS
// ======================================
function loadTeachers() {

    fetch(`${API}/admin/teachers`)
    .then(res => res.json())
    .then(data => {

        let html = `
            <h2>👨‍🏫 Teachers List</h2>
        `;

        if (data.length === 0) {
            html += `<p>No teachers found.</p>`;
        }

        data.forEach(teacher => {

            html += `
                <div class="card">
                    <p><strong>${teacher.name}</strong></p>
                    <p>${teacher.email}</p>
                </div>
            `;
        });

        document.getElementById("teachersSection").innerHTML = html;

        document.getElementById("addTeacherSection").style.display = "none";
        document.getElementById("reportsSection").innerHTML = "";
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load teachers");
    });
}

// ======================================
// SHOW ADD TEACHER FORM
// ======================================
function showAddTeacher() {

    document.getElementById("addTeacherSection").style.display = "block";

    document.getElementById("teachersSection").innerHTML = "";
    document.getElementById("reportsSection").innerHTML = "";
}

// ======================================
// ADD TEACHER
// ======================================
function addTeacher() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill in all fields");
        return;
    }

    fetch(`${API}/admin/teacher`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        // CLEAR FORM
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        loadTeachers();
    })
    .catch(err => {
        console.error(err);
        alert("Failed to add teacher");
    });
}

// ======================================
// LOGOUT
// ======================================
function logout() {

    localStorage.clear();

    alert("Logged out successfully");

    window.location.href = "index.html";
}