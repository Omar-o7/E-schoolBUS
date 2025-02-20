// public/js/map.js

import { db } from '../../config/firebase.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// تشغيل الدالة لتحديث موقع الحافلة
updateBusLocationFromFirestore();

// دالة للحصول على موقع المستخدم الحالي باستخدام Geolocation API
document.getElementById('locateButton').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLng = position.coords.longitude;
            const userLat = position.coords.latitude;

            // تحديث مركز الخريطة إلى موقع المستخدم
            map.flyTo({
                center: [userLng, userLat],
                zoom: 15
            });

            // إضافة علامة موقع للمستخدم
            new maplibregl.Marker({ color: 'red' })
                .setLngLat([userLng, userLat])
                .setPopup(new maplibregl.Popup().setText('Your Location'))
                .addTo(map);
        }, (error) => {
            alert('Error getting your location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});