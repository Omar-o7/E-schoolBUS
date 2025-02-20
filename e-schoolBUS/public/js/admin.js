// public/js/admin.js

import { db } from '../../config/firebase.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// دالة لإضافة سائق جديد
document.getElementById('addDriverForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const driverName = document.getElementById('driverName').value;
    const driverEmail = document.getElementById('driverEmail').value;

    try {
        await addDoc(collection(db, "drivers"), {
            name: driverName,
            email: driverEmail,
        });
        alert("Driver added successfully!");
        loadDrivers();
    } catch (error) {
        console.error("Error adding driver:", error.message);
    }
});

// دالة لإضافة طالب جديد
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentName = document.getElementById('studentName').value;
    const studentEmail = document.getElementById('studentEmail').value;

    try {
        await addDoc(collection(db, "students"), {
            name: studentName,
            parentEmail: studentEmail,
        });
        alert("Student added successfully!");
        loadStudents();
    } catch (error) {
        console.error("Error adding student:", error.message);
    }
});

// دالة لتحميل قائمة السائقين
async function loadDrivers() {
    const driversList = document.getElementById('driversList');
    driversList.innerHTML = "<h3>Drivers:</h3>";

    try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        querySnapshot.forEach((doc) => {
            const driver = doc.data();
            driversList.innerHTML += `<p>${driver.name} (${driver.email})</p>`;
        });
    } catch (error) {
        console.error("Error loading drivers:", error.message);
    }
}

// دالة لتحميل قائمة الطلاب
async function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = "<h3>Students:</h3>";

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            studentsList.innerHTML += `<p>${student.name} (Parent Email: ${student.parentEmail})</p>`;
        });
    } catch (error) {
        console.error("Error loading students:", error.message);
    }
}

// تحميل البيانات عند فتح الصفحة
loadDrivers();
loadStudents();