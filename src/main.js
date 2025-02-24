// Vueの import を削除
// import { createApp } from 'vue'
// import App from './App.vue'
// import './styles/index.css'

document.addEventListener("DOMContentLoaded", () => {
    // 背景設定
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";

    // 要素の取得
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const form = document.getElementById("url-form");
    const urlInput = document.getElementById("url-input");
    const submitButton = document.getElementById("submit-button");
    const resultDiv = document.getElementById("result");

    // ハンバーガーメニューの開閉
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("hidden");
    });

    // フォームの送信処理
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // URLの形式を検証
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        if (!urlPattern.test(urlInput.value)) {
            resultDiv.className = "mt-4 text-center text-red-500";
            resultDiv.textContent = "正しいURLの形式で入力してください";
            return;
        }

        // Turnstileのトークンを取得
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;
        if (!turnstileResponse) {
            resultDiv.className = "mt-4 text-center text-red-500";
            resultDiv.textContent = "認証を完了してください";
            return;
        }

        // ボタンを無効化し、ローディング状態を表示
        submitButton.disabled = true;
        submitButton.textContent = "送信中...";
        resultDiv.textContent = "";

        try {
            const response = await fetch("/api/check-url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: urlInput.value,
                    turnstileToken: turnstileResponse
                })
            });

            const data = await response.json();
            console.log('Response:', data); // デバッグ用

            if (response.ok) {
                resultDiv.className = "mt-4 text-center text-green-500";
                resultDiv.textContent = "通報ありがとうございます。URLを受け付けました。";
                urlInput.value = ""; // フォームをクリア
            } else {
                resultDiv.className = "mt-4 text-center text-red-500";
                resultDiv.textContent = data.message || "エラーが発生しました";
            }
        } catch (error) {
            console.error('Error:', error); // デバッグ用
            resultDiv.className = "mt-4 text-center text-red-500";
            resultDiv.textContent = "サーバーとの通信に失敗しました";
        } finally {
            // ボタンを再度有効化
            submitButton.disabled = false;
            submitButton.textContent = "送信";
        }
    });
});

// Vueの初期化を削除
// const app = createApp(App)
// app.mount('#app')
