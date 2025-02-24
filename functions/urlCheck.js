async function validateUrl(url) {
    // URLの形式チェック
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
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
        return 'URLへのアクセス中にエラーが発生しました';
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

        // URLの検証ロジックをここに追加
        const result = await validateUrl(url);

        return new Response(
            JSON.stringify({ message: result }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: 'サーバーエラーが発生しました' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
