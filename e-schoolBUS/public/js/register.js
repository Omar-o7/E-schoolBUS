// public/js/register.js
import { auth } from '../../config/firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { db } from '../../config/firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!role) {
        document.getElementById('errorMessage').textContent = "Please select a role.";
        return;
    }

    try {
        // إنشاء حساب جديد باستخدام Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // حفظ بيانات المستخدم في Firestore
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: name,
            email: email,
            role: role,
        });

        alert("Registration successful!");
        window.location.href = "/views/login.html"; // إعادة توجيه إلى صفحة تسجيل الدخول
    } catch (error) {
        document.getElementById('errorMessage').textContent = "Error during registration.";
        console.error("Error registering user:", error.message);
    }
});