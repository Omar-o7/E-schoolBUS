// public/js/report.js

import { db } from '../../config/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

// دالة لتحميل تقرير الحضور والغياب
let allData = []; // تخزين جميع البيانات لاستخدامها في التصفية

async function loadAttendanceReport() {
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    attendanceTableBody.innerHTML = ""; // مسح الجدول قبل تحديثه
    allData = []; // إعادة تهيئة البيانات

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentName = student.name;
            const attendanceStatus = student.attendance || "N/A"; // إذا لم يتم تسجيل الحضور
            const date = new Date().toLocaleDateString(); // التاريخ الحالي

            // تخزين البيانات
            allData.push({ name: studentName, date, status: attendanceStatus });

            // إنشاء صف جديد في الجدول
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${studentName}</td>
                <td>${date}</td>
                <td>${attendanceStatus}</td>
            `;
            attendanceTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading attendance report:", error.message);
    }
}

// دالة لتصفية التقرير
window.filterReport = () => {
    const studentFilter = document.getElementById('studentFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    attendanceTableBody.innerHTML = "";

    allData.forEach((record) => {
        const matchesStudent = record.name.toLowerCase().includes(studentFilter);
        const matchesDate = dateFilter ? record.date === dateFilter : true;

        if (matchesStudent && matchesDate) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.date}</td>
                <td>${record.status}</td>
            `;
            attendanceTableBody.appendChild(row);
        }
    });
};

// دالة لتصدير التقرير كملف PDF
window.exportReport = () => {
    const doc = new jsPDF();
    const table = document.getElementById('attendanceTable');

    // تحويل الجدول إلى نص
    const rows = [];
    table.querySelectorAll('tr').forEach((row) => {
        const rowData = [];
        row.querySelectorAll('th, td').forEach((cell) => {
            rowData.push(cell.innerText);
        });
        rows.push(rowData);
    });

    // إضافة الجدول إلى PDF
    doc.autoTable({
        head: [rows[0]], // الصف الأول كعنوان
        body: rows.slice(1), // باقي الصفوف كبيانات
    });

    // تنزيل الملف
    doc.save('attendance-report.pdf');
};

// تحميل التقرير عند فتح الصفحة
loadAttendanceReport();