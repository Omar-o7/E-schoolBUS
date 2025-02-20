// public/js/parentDashboard.js

import { db, auth } from '../../config/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import maplibregl from 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js';

// إعداد الرسائل
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');

// التحقق من صلاحية المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم مسجل الدخول
        console.log("User is signed in:", user.email);
        loadAllData();
    } else {
        // المستخدم غير مسجل الدخول
        errorMessage.textContent = "You must be logged in to access this page.";
        errorMessage.style.display = 'block';
        loadingMessage.style.display = 'none';
    }
});

// إعداد الخريطة
const map = new maplibregl.Map({
    container: 'map', // ID عنصر الخريطة
    style: 'https://demotiles.maplibre.org/style.json', // نمط الخريطة
    center: [35.2332, 31.9522], // إحداثيات عمان، الأردن
    zoom: 13 // مستوى التكبير
});

// إضافة علامة موقع للحافلة
let busMarker = new maplibregl.Marker()
    .setLngLat([35.2332, 31.9522]) // إحداثيات العلامة الافتراضية
    .addTo(map);

// تخزين البيانات بشكل مؤقت
let cachedAttendanceRecords = [];
let cachedNotifications = [];

// دالة لتحميل جميع البيانات
function loadAllData() {
    loadAttendanceStatus();
    loadMonthlyReports();
    updateBusLocationFromFirestore();
    loadNotifications();
}

// دالة لعرض حالة الحضور
async function loadAttendanceStatus() {
    const studentNameElement = document.getElementById('studentName');
    const attendancePercentageElement = document.getElementById('attendancePercentage');

    try {
        loadingMessage.style.display = 'block'; // عرض رسالة التحميل
        errorMessage.style.display = 'none'; // إخفاء رسالة الخطأ

        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentName = student.name;

            // افتراض أن لدينا سجلًا يوميًا للحضور في Firestore
            const attendanceRecords = student.attendanceRecords || [];
            cachedAttendanceRecords = attendanceRecords; // تخزين البيانات بشكل مؤقت

            const totalDays = attendanceRecords.length;
            const daysPresent = attendanceRecords.filter(record => record === "present").length;

            // حساب نسبة الحضور
            const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

            // عرض البيانات
            studentNameElement.textContent = `Student Name: ${studentName}`;
            attendancePercentageElement.textContent = `Attendance Percentage: ${attendancePercentage}%`;
        });

        loadingMessage.style.display = 'none'; // إخفاء رسالة التحميل
    } catch (error) {
        console.error("Error loading attendance status:", error.message);
        errorMessage.textContent = "Failed to load attendance data.";
        errorMessage.style.display = 'block'; // عرض رسالة الخطأ
        loadingMessage.style.display = 'none'; // إخفاء رسالة التحميل
    }
}

// دالة لعرض التقارير الشهرية
function loadMonthlyReports() {
    const monthlyReportTableBody = document.querySelector('#monthlyReportTable tbody');
    monthlyReportTableBody.innerHTML = ""; // مسح الجدول قبل تحديثه

    cachedAttendanceRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Day ${index + 1}</td>
            <td>${record}</td>
        `;
        monthlyReportTableBody.appendChild(row);
    });
}

// دالة لتحديث موقع الحافلة من Firestore
function updateBusLocationFromFirestore() {
    const busesRef = collection(db, "buses"); // جمع بيانات الحافلات

    // استماع للتغييرات في Firestore
    onSnapshot(busesRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const busData = doc.data();
            const busLocation = [busData.lng, busData.lat]; // إحداثيات الحافلة

            // تحديث موقع العلامة
            busMarker.setLngLat(busLocation);

            // تحريك الخريطة إلى موقع الحافلة
            map.flyTo({
                center: busLocation,
                zoom: 15
            });
        });
    });
}

// دالة لعرض الإشعارات
function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = ""; // مسح الإشعارات السابقة

    const notifications = [
        { title: "Bus Arrival", body: "The bus will arrive in 5 minutes." },
        { title: "Low Attendance", body: "Your child's attendance is below 75%." },
        { title: "School Event", body: "Parent-Teacher meeting scheduled for tomorrow." }
    ];

    cachedNotifications = notifications; // تخزين البيانات بشكل مؤقت

    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.textContent = `${notification.title}: ${notification.body}`;
        notificationsList.appendChild(listItem);
    });
}

// دالة للبحث والتصفية
window.filterData = () => {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    // تصفية التقارير
    const monthlyReportTableBody = document.querySelector('#monthlyReportTable tbody');
    monthlyReportTableBody.innerHTML = "";

    cachedAttendanceRecords.forEach((record, index) => {
        if (record.toLowerCase().includes(searchInput)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Day ${index + 1}</td>
                <td>${record}</td>
            `;
            monthlyReportTableBody.appendChild(row);
        }
    });

    // تصفية الإشعارات
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = "";

    cachedNotifications.forEach(notification => {
        if (notification.title.toLowerCase().includes(searchInput) || notification.body.toLowerCase().includes(searchInput)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${notification.title}: ${notification.body}`;
            notificationsList.appendChild(listItem);
        }
    });
};