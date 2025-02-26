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
        console.error('Validation error:', error);
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

    if (!context.env.ZOMBIE_URLS) {
        console.error('KV binding not found in context.env:', context.env);
        throw new Error('KV binding not found');
    }

    try {
        const key = `url_${btoa(url)}`;
        console.log('Saving to KV:', { key, data });
        await context.env.ZOMBIE_URLS.put(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('KV save error:', error);
        throw error;
    }
}

async function verifyTurnstileToken(token) {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            secret: '0x4AAAAAAA-YmC85x7NZifJiXciC5JPYffM',
            response: token,
        }),
    });

    const data = await response.json();
    return data.success;
}

export async function onRequestPost(context) {
    try {
        // デバッグ: 利用可能な環境変数を確認
        console.log('Available env:', Object.keys(context.env));

        if (!context.env.ZOMBIE_URLS) {
            console.error('KV binding missing. Available env:', context.env);
            throw new Error('KV binding not found');
        }

        const request = await context.request.json();
        const { url, turnstileToken } = request;

        if (!url || !turnstileToken) {
            return new Response(
                JSON.stringify({ message: '必要な情報が不足しています' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );
        }

        // Turnstileトークンを検証
        const isValid = await verifyTurnstileToken(turnstileToken);
        if (!isValid) {
            return new Response(
                JSON.stringify({ message: '認証に失敗しました' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );
        }

        // URLの検証
        const validationResult = await validateUrl(url);
        if (validationResult !== 'URLの検証が完了しました') {
            return new Response(
                JSON.stringify({ message: validationResult }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );
        }

        // クライアント情報の取得
        const clientInfo = {
            ip: context.request.headers.get('cf-connecting-ip'),
            userAgent: context.request.headers.get('user-agent'),
        };

        // KVに保存
        const savedToKV = await saveToKV(context, url, clientInfo);
        if (!savedToKV) {
            throw new Error('データの保存に失敗しました');
        }

        return new Response(
            JSON.stringify({
                message: '通報を受け付けました。ご協力ありがとうございます。',
                details: validationResult
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
    } catch (error) {
        console.error('エラー:', error);
        return new Response(
            JSON.stringify({ message: error.message || 'サーバーエラーが発生しました' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
    }
}
