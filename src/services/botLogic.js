const { delay } = require('../utils');
const { ADMIN_NUMBER } = require('../config');
const { getAIResponse } = require('./aiService');

/**
 * Textos y Menús del sistema - youngAI 🕵️‍♀️🤖
 */
const MAIN_MENU = `Hola 👋 Soy *youngAI 🕵️‍♀️🤖* ¿En qué te puedo ayudar hoy?

1️⃣ *Servicios y Tecnologías*
2️⃣ *Precios*
3️⃣ *Comprar Productos*
4️⃣ *Agendar Directamente*

_Escribe el número o tu consulta directamente._`;

const TRIGGER_WORDS = [
    'web', 'página', 'sitio', 'website', 'tienda', 'ecommerce', 'e-commerce',
    'sistema', 'plataforma', 'landing', 'diseño', 'flyer', 'logo', 'branding',
    'identidad', 'marca', 'desarrollo', 'programar', 'código', 'php',
    'javascript', 'python', 'automatización', 'precio', 'cotizar', 'valor',
    'contratar', 'servicio', 'proyecto', 'negocio'
];

const RESPONSES = {
    '1': `💼 *Servicios y Tecnologías*

*Servicios principales:*
• Páginas web modernas y profesionales
• Tiendas online (E-commerce)
• Diseño UX/UI avanzado
• Landing pages de alto impacto
• Sistemas web personalizados
• Automatizaciones

*Diseño gráfico:*
• Flyers digitales, Logos, Branding
• Diseño para redes sociales

*Tecnologías:*
HTML, CSS, JavaScript, PHP, Python.

¿Qué tipo de servicio estás buscando?`,

    '2': `💰 *Precios*

Los precios dependen de la complejidad de tu proyecto.

Puedes revisar mis *planes y precios actualizados* aquí:
👉 https://portfolio.youngstarsstore.com/#pricing

¿Qué tipo de proyecto tienes en mente?`,

    '3': `🛒 *Comprar Productos*

Puedes comprar productos digitales directamente en nuestra tienda online:
👉 https://youngstarsstore.com

¿Hay algo específico que estés buscando?`,

    '4': `📞 *Agendar Directamente*

Perfecto 👍 Podemos hablar directamente y ver tu proyecto en detalle.

Puedes contactarnos vía:
• *WhatsApp*: +56968756891 
• *Formulario*: portfolio.youngstarsstore.com/#contact
• *Email*: contacto@youngstarsstore.com 

¿Cuándo te viene mejor para conversar?`
};

/**
 * Manejador principal de mensajes
 */
async function handleMessage(sock, msg, text) {
    if (!text) return;

    const remoteJid = msg.key.remoteJid;
    const cleanText = text.trim().toLowerCase();
    const senderNumber = remoteJid.replace('@s.whatsapp.net', '');

    // --- COMANDOS DE ADMIN ---
    if (cleanText === '!status' || cleanText === 'admin status') {
        if (ADMIN_NUMBER && senderNumber.includes(ADMIN_NUMBER)) {
            await sock.sendMessage(remoteJid, {
                text: `🔰 *ESTADO DEL SISTEMA*\n\n✅ *Online*: Sí\n⏱ *Uptime*: ${process.uptime().toFixed(2)}s\n📅 *Fecha*: ${new Date().toLocaleString()}`
            });
            return;
        }
    }

    // --- FILTRO GATEKEEPER (Filtro de Activación) ---
    const greetings = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'inicio', 'menu', 'holl'];
    const isGreeting = greetings.some(word => cleanText.includes(word));
    const isMenuOption = ['1', '2', '3', '4'].includes(cleanText);
    const hasTrigger = TRIGGER_WORDS.some(word => cleanText.includes(word));

    // Si no es saludo, ni opción de menú, ni tiene triggers, enviamos la respuesta mínima
    if (!isGreeting && !isMenuOption && !hasTrigger) {
        // Ignoramos menciones a ChatGPT/OpenAI según requerimiento
        if (cleanText.includes('chatgpt') || cleanText.includes('openai')) return;

        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(1000);
        await sock.sendMessage(remoteJid, {
            text: "Hola 👋 Para ayudarte mejor, dime si buscas algo relacionado con páginas web, tiendas online o diseño digital."
        });
        return;
    }

    // --- FLUJO ACTIVADO ---

    // Mostrar menú principal
    if (isGreeting || cleanText === '0') {
        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(1500);
        await sock.sendMessage(remoteJid, { text: MAIN_MENU });
        return;
    }

    // Respuestas numéricas
    if (RESPONSES[cleanText]) {
        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(2000);
        await sock.sendMessage(remoteJid, { text: RESPONSES[cleanText] });
        return;
    }

    // Inteligencia Artificial (OpenAI) como fallback inteligente
    try {
        await sock.sendPresenceUpdate('composing', remoteJid);

        // Obtenemos respuesta de la IA
        const aiResponse = await getAIResponse(text);

        await sock.sendMessage(remoteJid, { text: aiResponse });
    } catch (error) {
        console.error('Error en AI Fallback:', error);
        await sock.sendMessage(remoteJid, {
            text: "Disculpa, estoy teniendo un problema técnico. ¿Podrías intentar de nuevo o escribir *menu*?"
        });
    }
}

module.exports = { handleMessage };
