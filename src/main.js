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
        e.preventDefault();

        // URLの形式を検証（クライアントサイド）
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        if (!urlPattern.test(urlInput.value)) {
            resultDiv.className = 'mt-4 text-center text-red-500';
            resultDiv.textContent = '正しいURLの形式で入力してください';
            return;
        }

        // ボタンを無効化し、ローディング状態を表示
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
        resultDiv.textContent = '';

        try {
            const response = await fetch('/api/check-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: urlInput.value })
            });

            const data = await response.json();

            if (response.ok) {
                resultDiv.className = 'mt-4 text-center text-green-500';
                resultDiv.textContent = '通報ありがとうございます。URLを受け付けました。';
                urlInput.value = ''; // フォームをクリア
            } else {
                resultDiv.className = 'mt-4 text-center text-red-500';
                resultDiv.textContent = data.message || 'エラーが発生しました';
            }
        } catch (error) {
            resultDiv.className = 'mt-4 text-center text-red-500';
            resultDiv.textContent = 'サーバーとの通信に失敗しました';
        } finally {
            // ボタンを再度有効化
            submitButton.disabled = false;
            submitButton.textContent = '送信';
        }
    });
});

const app = createApp(App)
app.mount('#app')
