// public/js/attendance.js

import { db } from '../../config/firebase.js';
import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// دالة لتحميل قائمة الطلاب
async function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = "<h3>Students:</h3>";

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentId = doc.id;

            // إنشاء عنصر لكل طالب
            const studentDiv = document.createElement('div');
            studentDiv.innerHTML = `
                <p>${student.name} (${student.parentEmail})</p>
                <label>
                    <input type="radio" name="status-${studentId}" value="present" onclick="updateAttendance('${studentId}', 'present')"> Present
                </label>
                <label>
                    <input type="radio" name="status-${studentId}" value="absent" onclick="updateAttendance('${studentId}', 'absent')"> Absent
                </label>
            `;
            studentsList.appendChild(studentDiv);
        });
    } catch (error) {
        console.error("Error loading students:", error.message);
    }
}

// دالة لتحديث حالة الحضور والغياب
window.updateAttendance = async (studentId, status) => {
    try {
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { attendance: status });
        alert(`Attendance updated for student ID: ${studentId}`);
    } catch (error) {
        console.error("Error updating attendance:", error.message);
    }
};

// تحميل بيانات الطلاب عند فتح الصفحة
loadStudents();