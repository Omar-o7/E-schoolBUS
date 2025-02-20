// public/js/notifications.js

import { db, messaging } from '../../config/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js";

// دالة لطلب إذن الإشعارات وتسجيل الجهاز
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // الحصول على رمز الجهاز (Token) الخاص بالإشعارات
            const token = await getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" });
            console.log("Notification token:", token);
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error.message);
    }
}

// دالة لإرسال إشعارات تلقائية لأولياء الأمور
async function sendLowAttendanceNotifications() {
    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentName = student.name;
            const parentEmail = student.parentEmail;

            // افتراض أن لدينا سجلًا يوميًا للحضور في Firestore
            const attendanceRecords = student.attendanceRecords || [];
            const totalDays = attendanceRecords.length;
            const daysPresent = attendanceRecords.filter(record => record === "present").length;

            // حساب نسبة الحضور
            const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

            // إذا كانت نسبة الحضور أقل من 75%، أرسل إشعارًا
            if (attendancePercentage < 75) {
                sendNotification(parentEmail, `Low Attendance Alert for ${studentName}`, `Your child's attendance is only ${attendancePercentage}%. Please ensure regular attendance.`);
            }
        });
    } catch (error) {
        console.error("Error sending notifications:", error.message);
    }
}

// دالة لإرسال الإشعار (يمكن استبدالها بخدمة خارجية مثل Firebase Cloud Functions)
function sendNotification(email, title, body) {
    // هنا يمكنك استخدام خدمة مثل Firebase Cloud Functions أو أي API لإرسال الإشعارات
    console.log(`Notification sent to ${email}:`, { title, body });

    // مثال على إشعار داخل المتصفح
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: body,
        });
    }
}

// استقبال الإشعارات في الخلفية
onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
            body: payload.notification.body,
        });
    }
});

// طلب إذن الإشعارات عند تحميل الصفحة
requestNotificationPermission();

// إرسال إشعارات تلقائية عند فتح الصفحة
sendLowAttendanceNotifications();