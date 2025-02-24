import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.backgroundColor = "#ffffff"; // 背景を白に設定
    document.body.style.color = "#000000"; // テキストを黒に設定

    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    // ハンバーガーメニューの開閉
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("hidden");
    });

    // URLバリデーション
    const form = document.getElementById("url-check-form");
    const urlInput = document.getElementById("url");
    const errorMessage = document.getElementById("error-message");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        if (!urlPattern.test(urlInput.value)) {
            errorMessage.classList.remove("hidden");
        } else {
            errorMessage.classList.add("hidden");
            alert("URLが正しく入力されました！");
        }
    });
});

const app = createApp(App)
app.mount('#app')
