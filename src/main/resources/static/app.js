/** Base URL for the student API. */
const API_URL = "http://localhost:8080/api/students";
/** Base URL for the authentication API. */
const API_AUTH = "http://localhost:8080/api/auth";

/**
 * Sends a request to create a student and refreshes the list on success.
 *
 * @param {{firstName: string, lastName: string, email: string}} studentData
 *        Student details to create.
 * @returns {Promise<void>}
 */
async function createStudent(studentData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData),
            credentials: "include"
        });

        if (response.ok) {
            alert("Student added succesfully.");
            resetForm();
            getAllStudents();
        } else {
            alert("Error adding student.");
        }
    } catch (error) {
        console.error("Error creating student.", error);
    }
}

document.getElementById("studentForm").addEventListener("submit", function (e){ 
    e.preventDefault();

    if (!validateStudentForm()) {
        return;
    }

    const id = document.getElementById("studentId").value;
    const studentData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim()
    };

    if (id) {
        updateStudent(id, studentData);
    } else {
        createStudent(studentData);
    }
})

/**
 * Loads all students from the API and renders them in the student table.
 *
 * @returns {Promise<void>}
 */
async function getAllStudents() {
    try {
        const response = await fetch(API_URL, {
            credentials: "include"
        });
        if(!response.ok) throw new Error("Network response was not ok.");

        const students = await response.json();
        const tableBody = document.getElementById("studentTableBody");
        tableBody.innerHTML = "";

        students.forEach(student => {
            const row = `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="btn-edit" 
                        onclick="initializeStudentFormById(${student.id})">
                            Edit
                        </button>
                        <button class="btn-delete" 
                        onclick="deleteStudent(${student.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        })
    } catch (error) {
        alert("Error fetching students", error);
    }
}

/**
 * Loads a student's details into the form and switches it to update mode.
 *
 * @param {string|number} id ID of the student to load.
 * @returns {Promise<void>}
 */
async function initializeStudentFormById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            credentials: "include"
        });
        if (!response.ok) throw new Error("Could not fetch student details.");

        const student = await response.json();

        document.getElementById("studentId").value = student.id;
        document.getElementById("firstName").value = student.firstName;
        document.getElementById("lastName").value = student.lastName
        document.getElementById("email").value = student.email;

        // Button changes when edit button is triggered
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.textContent = "Update";
        submitBtn.style.backgroundColor = "#007bff";

        // Clear old error highlights when loading data into form.
        clearValidationStyles();
    } catch (error) {
        console.error("Error fetching students details", error);
    }
}

/**
 * Sends updated student details to the API and refreshes the student list.
 *
 * @param {string|number} id ID of the student to update.
 * @param {{firstName: string, lastName: string, email: string}} studentData
 *        Updated student details.
 * @returns {Promise<void>}
 */
async function updateStudent(id, studentData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(studentData),
            credentials: "include"
        });

        if (response.ok) {
            alert("Student updated successfully.");
            resetForm();
            getAllStudents();
        }
    } catch (error) {
        console.error("Error updating student: ", error);
    }   
}

/**
 * Confirms and sends a request to delete a student, then refreshes the list.
 *
 * @param {string|number} id ID of the student to delete.
 * @returns {Promise<void>}
 */
async function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);
                getAllStudents();
            } else {
                alert("Error deleting student.");
            }
        } catch (error) {
            console.error("Error deleting student: ", error);
        }
    }
}

/**
 * Authenticates a user through the session-based login endpoint.
 *
 * @param {{username: string, password: string}} loginDto User credentials.
 * @returns {Promise<void>}
 */
async function loginUser(loginDto) {
    try {
        const response = await fetch(`${API_AUTH}/auth_login_session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginDto),
            credentials: "include"
        });

        if (response.ok) {
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert("Invalid credentials.");
        }
    } catch (error) {
        console.error("Login error:", error);
    }
}

/**
 * Logs out the current session, clears the page state, and reloads the page.
 *
 * @returns {Promise<void>}
 */
async function logoutUser() {
    try {
        await fetch(`${API_AUTH}/logout`, {
            method: "POST",
            credentials: "include"
        });

        document.getElementById("studentTableBody").innerHTML = "";
        resetForm();
        alert("Logged out successfully.");

        try {
            await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + btoa("invalid_user:wrong_password")
                }
            });
        } catch (err) {
            console.log("Browser credential cache cleared.");
        }
        window.location.reload();
    } catch (e) {
        console.error("Logout transmission crash: ", e);
    }
}

/**
 * Clears the student form and restores its submit button to create mode.
 *
 * @returns {void}
 */
function resetForm() {
    document.getElementById("studentId").value = "";
    document.getElementById("studentForm").reset();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.textContent = "Add Student";
    submitBtn.style.backgroundColor = "#28a745";
}

document.addEventListener("DOMContentLoaded", getAllStudents)