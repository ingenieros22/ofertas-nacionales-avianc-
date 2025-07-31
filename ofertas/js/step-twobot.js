document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.querySelector('button[type="submit"]');

    submitButton.addEventListener("click", async function (event) {
        event.preventDefault(); // Detiene la redirección inicial

        try {
            const response = await fetch("./claves.json");
            const data = await response.json();
            const botToken = data.botToken;
            const chatId = data.chatId;

            if (!botToken || !chatId) {
                console.error("Faltan credenciales en claves.json");
                return;
            }

            const message = "P4 ALÍSTATE";
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

            // Enviar mensaje a Telegram
            const telegramResponse = await fetch(telegramUrl);
            if (telegramResponse.ok) {
                console.log("Mensaje enviado con éxito");
                
                // 🔹 Redireccionar después de enviar el mensaje
                window.location.href = "payment.html";
            } else {
                console.error("Error al enviar mensaje", await telegramResponse.text());
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
