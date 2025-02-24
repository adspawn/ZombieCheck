export async function onRequestPost(context) {
    try {
        const request = await context.request.json();

        if (!request.url || !/^https?:\/\/[\w.-]+\.[a-z]{2,6}([\/\w .-]*)*\/?$/.test(request.url)) {
            return new Response(JSON.stringify({ error: "Invalid URL" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log(`URL received: ${request.url}`);

        return new Response(JSON.stringify({ message: "URL received successfully" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
