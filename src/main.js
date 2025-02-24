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
    const form = document.querySelector('form');
    const urlInput = document.querySelector('#url-input');
    const submitButton = document.querySelector('#submit-button');
    const resultDiv = document.querySelector('#result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // フォームのデフォルトの送信を防ぐ

        // ボタンを無効化し、ローディング状態を表示
        submitButton.disabled = true;
        submitButton.textContent = '処理中...';

        try {
            const response = await fetch('/api/check-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: urlInput.value })
            });

            const data = await response.json();
            if (!response.ok) {
                resultDiv.className = 'mt-4 text-red-500';
            } else {
                resultDiv.className = 'mt-4 text-green-500';
            }
            resultDiv.textContent = data.message;
        } catch (error) {
            resultDiv.className = 'mt-4 text-red-500';
            resultDiv.textContent = 'エラーが発生しました。もう一度お試しください。';
        } finally {
            // ボタンを再度有効化
            submitButton.disabled = false;
            submitButton.textContent = '送信';
        }
    });
});

const app = createApp(App)
app.mount('#app')
