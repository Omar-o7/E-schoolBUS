// public/js/monthlyReport.js

import { db } from '../../config/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let chartInstance = null; // تخزين مثيل الرسم البياني

// دالة لتحميل التقرير الشهري
async function loadMonthlyReport() {
    const monthlyReportTableBody = document.querySelector('#monthlyReportTable tbody');
    monthlyReportTableBody.innerHTML = ""; // مسح الجدول قبل تحديثه

    const studentNames = [];
    const attendancePercentages = [];

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentName = student.name;

            // افتراض أن لدينا سجلًا يوميًا للحضور في Firestore
            const attendanceRecords = student.attendanceRecords || [];
            const totalDays = attendanceRecords.length;
            const daysPresent = attendanceRecords.filter(record => record === "present").length;

            // حساب نسبة الحضور
            const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

            // تخزين البيانات للرسم البياني
            studentNames.push(studentName);
            attendancePercentages.push(attendancePercentage);

            // إنشاء صف جديد في الجدول
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${studentName}</td>
                <td>${daysPresent}</td>
                <td>${totalDays}</td>
                <td>${attendancePercentage}%</td>
            `;
            monthlyReportTableBody.appendChild(row);
        });

        // إنشاء الرسم البياني لأول مرة
        createAttendanceChart(studentNames, attendancePercentages, 'bar');
    } catch (error) {
        console.error("Error loading monthly report:", error.message);
    }
}

// دالة لإنشاء الرسم البياني
function createAttendanceChart(labels, data, type) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy(); // حذف الرسم البياني الحالي إذا كان موجودًا
    }

    chartInstance = new Chart(ctx, {
        type: type, // نوع الرسم البياني
        data: {
            labels: labels, // أسماء الطلاب
            datasets: [{
                label: 'Attendance Percentage (%)',
                data: data, // نسب الحضور
                backgroundColor: data.map(percentage => percentage >= 75 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
                borderColor: data.map(percentage => percentage >= 75 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100 // الحد الأقصى لنسبة الحضور هو 100%
                }
            }
        }
    });
}

// دالة لتغيير نوع الرسم البياني
window.changeChartType = (type) => {
    const labels = chartInstance.data.labels;
    const data = chartInstance.data.datasets[0].data;
    createAttendanceChart(labels, data, type);
};

// تحميل التقرير عند فتح الصفحة
loadMonthlyReport();