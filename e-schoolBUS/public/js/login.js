// public/js/login.js
import { auth } from '../../config/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        alert("Login successful!");
        // يمكنك إعادة توجيه المستخدم إلى صفحة أخرى هنا
    } catch (error) {
        document.getElementById('errorMessage').textContent = "Invalid email or password.";
        console.error("Error logging in:", error.message);
    }
});