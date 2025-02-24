async function validateUrl(url) {
    // URLの形式チェック（より緩やかな正規表現に変更）
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    if (!urlPattern.test(url)) {
        return '無効なURLの形式です';
    }

    try {
        // URLが実際にアクセス可能かチェック
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
            return 'このURLにアクセスできません';
        }
        return 'URLの検証が完了しました';
    } catch (error) {
        console.error('Validation error:', error); // デバッグ用
        return 'URLへのアクセス中にエラーが発生しました';
    }
}

async function sendEmailNotification(url, clientInfo) {
    const timestamp = new Date().toISOString();
    const emailContent = {
        to: 'adspawn@gmail.com',
        from: 'notification@zombiecheck.com',
        subject: '新しいゾンビURLが通報されました',
        text: `
通報されたURL: ${url}
通報日時: ${timestamp}
IPアドレス: ${clientInfo.ip}
ユーザーエージェント: ${clientInfo.userAgent}
        `
    };

    try {
        await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(emailContent),
        });
        return true;
    } catch (error) {
        console.error('メール送信エラー:', error);
        return false;
    }
}

async function saveToKV(context, url, clientInfo) {
    const timestamp = new Date().toISOString();
    const data = {
        url: url,
        timestamp: timestamp,
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent
    };

    try {
        // URLをキーとして使用し、重複を防ぐ
        const key = `url_${btoa(url)}`;
        await context.env.ZOMBIE_URLS.put(key, JSON.stringify(data));
        console.log('KVに保存成功:', key);
        return true;
    } catch (error) {
        console.error('KV保存エラー:', error);
        return false;
    }
}

export async function onRequestPost(context) {
    try {
        const request = await context.request.json();
        const { url } = request;

        if (!url) {
            return new Response(
                JSON.stringify({ message: 'URLを入力してください' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // URLの検証
        const validationResult = await validateUrl(url);

        // クライアント情報の取得
        const clientInfo = {
            ip: context.request.headers.get('cf-connecting-ip'),
            userAgent: context.request.headers.get('user-agent'),
        };

        // KVに保存
        const savedToKV = await saveToKV(context, url, clientInfo);

        if (!savedToKV) {
            return new Response(
                JSON.stringify({ message: 'データの保存に失敗しました' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new Response(
            JSON.stringify({
                message: '通報を受け付けました。ご協力ありがとうございます。',
                details: validationResult
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('エラー:', error);
        return new Response(
            JSON.stringify({ message: 'サーバーエラーが発生しました' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
