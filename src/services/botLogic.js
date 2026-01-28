const { delay } = require('../utils');
const { ADMIN_NUMBER } = require('../config');
const { getAIResponse } = require('./aiService');

/**
 * Textos y Menús del sistema - YoungStars Design AI
 */
const MAIN_MENU = `👋 *Hola, soy YoungAI🕵️‍♀️🤖*

¿En qué te puedo ayudar hoy?

1️⃣ *Servicios y Tecnologías*
2️⃣ *Precios*
3️⃣ *Comprar Productos*
4️⃣ *Agendar Directamente*

_Diseño • Desarrollo • Innovación_`;

const RESPONSES = {
    '1': `💼 *Servicios y Tecnologías*

🌐 *Desarrollo Web*
• Páginas web modernas y profesionales
• Tiendas online (E-commerce)
• Landing pages de alto impacto
• Sistemas web personalizados
• Automatizaciones

🎨 *Diseño Gráfico*
• Flyers digitales
• Logos profesionales
• Branding e identidad visual
• Diseño para redes sociales

⚙️ *Tecnologías*
• HTML, CSS, JavaScript
• PHP, Python
• Animaciones modernas
• Integraciones de pago (Flow, MercadoPago)

¿Qué tipo de servicio estás buscando?`,

    '2': `💰 *Precios*

Los precios dependen del tipo de proyecto y sus características específicas.

Puedes revisar mis *planes y precios actualizados* aquí:
👉 https://portfolio.youngstarsstore.com/#pricing

También puedes ver ejemplos de proyectos en el portafolio.

¿Qué tipo de proyecto tienes en mente?`,

    '3': `🛒 *Comprar Productos*

Tengo productos digitales disponibles para compra directa.

Visita la tienda online:
👉 https://youngstarsstore.com

Encontrarás:
• Plantillas web
• Recursos de diseño
• Herramientas digitales
• Productos personalizados

¿Hay algo específico que estés buscando?`,

    '4': `📞 *Agendar Directamente*

Perfecto 👍 Podemos hablar directamente y ver tu proyecto en detalle.

Opciones de contacto:
• *WhatsApp*: +56968756891 
• *Formulario*: portfolio.youngstarsstore.com/#contact
• *Email*: contacto@youngstarsstore.com 

También puedes escribirme aquí mismo y coordinamos.

¿Cuándo te viene mejor para conversar?`
};

/**
 * Lógica principal de manejo de mensajes
 * @param {Object} sock Instancia del socket de Baileys
 * @param {Object} msg Objeto del mensaje recibido
 * @param {String} text Texto extraído del mensaje
 */
async function handleMessage(sock, msg, text) {
    if (!text) return;

    const remoteJid = msg.key.remoteJid;
    const cleanText = text.trim().toLowerCase();
    const senderNumber = remoteJid.replace('@s.whatsapp.net', '');

    // --- COMANDOS DE ADMIN ---
    if (cleanText === '!status' || cleanText === 'admin status') {
        // Verifica si el sender es el admin configurado en .env
        // Se puede hacer una validación más laxa si el .env no tiene el código de país exacto
        if (ADMIN_NUMBER && senderNumber.includes(ADMIN_NUMBER)) {
            await sock.sendMessage(remoteJid, {
                text: `🔰 *ESTADO DEL SISTEMA*\n\n✅ *Online*: Sí\n⏱ *Uptime*: ${process.uptime().toFixed(2)}s\n📅 *Fecha*: ${new Date().toLocaleString()}`
            });
            return;
        }
    }

    // --- FLUJO DE CLIENTES ---

    // Lista de palabras que activan el menú
    const greetings = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'inicio', 'menu', 'holl'];

    if (greetings.some(word => cleanText.includes(word)) || cleanText === '0') {
        // Simular escritura
        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(1500); // Espera natural

        await sock.sendMessage(remoteJid, { text: MAIN_MENU });
        return;
    }

    // Respuestas numéricas
    if (RESPONSES[cleanText]) {
        // Simular escritura
        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(2000); // Espera un poco más larga para respuestas con contenido

        await sock.sendMessage(remoteJid, { text: RESPONSES[cleanText] });
        return;
    }

    // Si no coincide con ningún comando, usa Gemini AI para responder
    // Esto permite conversaciones más naturales
    await sock.sendPresenceUpdate('composing', remoteJid);
    await delay(2000);

    const aiResponse = await getAIResponse(text);
    await sock.sendMessage(remoteJid, { text: aiResponse });
}

module.exports = { handleMessage };
