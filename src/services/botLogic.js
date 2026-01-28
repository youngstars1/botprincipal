const { delay } = require('../utils');
const { ADMIN_NUMBER } = require('../config');
const { getAIResponse } = require('./aiService');

/**
 * Textos y Menús del sistema - youngAI 🕵️‍♀️🤖
 */
const MAIN_MENU = `Hola 👋 Soy *youngAI 🕵️‍♀️🤖* ¿En qué te puedo ayudar hoy?

1️⃣ *Servicios y tecnologías*
2️⃣ *Precios*
3️⃣ *Comprar productos*
4️⃣ *Agendar contacto con un agente*

_Escribe el número o la palabra *menu* para ver estas opciones._`;

const TRIGGER_WORDS = [
    'web', 'página', 'paginas', 'sitio', 'website', 'webapp', 'app web',
    'landing', 'landing page', 'corporativa', 'desarrollo web', 'crear web', 'hacer web',
    'tienda', 'tienda online', 'ecommerce', 'e-commerce', 'shop', 'carrito', 'checkout', 'vender online',
    'woocommerce', 'shopify', 'diseño', 'diseño gráfico', 'flyer', 'volante', 'afiche',
    'logo', 'logotipo', 'branding', 'identidad visual', 'marca', 'rebranding',
    'mantenimiento web', 'soporte web', 'actualizar web', 'sistema', 'plataforma', 'software',
    'panel', 'dashboard', 'automatización', 'bot', 'chatbot', 'whatsapp bot', 'api',
    'programar', 'desarrollo', 'código', 'php', 'javascript', 'js', 'node', 'python',
    'precio', 'precios', 'valor', 'costo', 'cotizar', 'cotización', 'presupuesto',
    'cuánto cuesta', 'cuanto vale', 'contratar', 'servicio', 'plan', 'pago',
    'proyecto', 'negocio', 'emprendimiento', 'empresa', 'pyme', 'startup', 'cliente'
];

const FOLLOW_UP_PHRASES = [
    'cómo va mi proyecto', 'como va mi proyecto', 'estado del proyecto', 'cómo va el trabajo',
    'como va el trabajo', 'hay avances', 'en qué va lo mío', 'en que va lo mio',
    'cómo va mi pedido', 'como va mi pedido', 'estado del diseño', 'estado del web',
    'estado del logo', 'estado del flyer'
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

// Almacén de historial y estados en memoria
const CONVERSATION_HISTORY = {};
const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 minutos

/**
 * Manejador principal de mensajes
 */
async function handleMessage(sock, msg, text) {
    if (!text) return;

    const remoteJid = msg.key.remoteJid;
    const cleanText = text.trim().toLowerCase();
    const senderNumber = remoteJid.replace('@s.whatsapp.net', '');
    const now = Date.now();

    // 1. Gestión de Sesión y Expiración
    if (CONVERSATION_HISTORY[remoteJid]) {
        const lastActivity = CONVERSATION_HISTORY[remoteJid].lastActivity;

        if (now - lastActivity > SESSION_TIMEOUT) {
            // VERIFICAR SI YA SE ENVIÓ EL MENSAJE DE EXPIRACIÓN
            if (!CONVERSATION_HISTORY[remoteJid].expiredNotified) {
                CONVERSATION_HISTORY[remoteJid].expiredNotified = true;
                CONVERSATION_HISTORY[remoteJid].sessionActive = false;

                // Si el mensaje actual NO es "menu", enviamos notificación de expiración
                if (cleanText !== 'menu') {
                    await sock.sendMessage(remoteJid, {
                        text: "⏳ La sesión expiró. Escribe *menu* para ver los servicios disponibles."
                    });
                    return;
                }
            } else {
                // YA FUE NOTIFICADO. Solo responder si escribe "menu"
                if (cleanText !== 'menu') {
                    console.log(`🤐 Sesión expirada y ya notificada para ${senderNumber}. Ignorando.`);
                    return;
                }
            }
        }
    }

    // 2. Inicializar o Resetear con "menu"
    if (!CONVERSATION_HISTORY[remoteJid] || cleanText === 'menu') {
        CONVERSATION_HISTORY[remoteJid] = {
            messages: [],
            lastActivity: now,
            serviceSelected: null,
            flowLevel: 'inicio',
            expiredNotified: false,
            sessionActive: true
        };

        if (cleanText === 'menu') {
            await sock.sendPresenceUpdate('composing', remoteJid);
            await delay(1000);
            await sock.sendMessage(remoteJid, { text: MAIN_MENU });
            return;
        }
    }

    // Actualizar última actividad
    CONVERSATION_HISTORY[remoteJid].lastActivity = now;

    // --- COMANDOS DE ADMIN ---
    if (cleanText === '!status' || cleanText === 'admin status') {
        if (ADMIN_NUMBER && senderNumber.includes(ADMIN_NUMBER)) {
            await sock.sendMessage(remoteJid, {
                text: `🔰 *ESTADO DEL SISTEMA*\n\n✅ *Online*: Sí\n⏱ *Uptime*: ${process.uptime().toFixed(2)}s\n📅 *Fecha*: ${new Date().toLocaleString()}`
            });
            return;
        }
    }

    // --- FILTRO DE ACTIVACIÓN ESTRICTO ---
    const isMenuOption = ['1', '2', '3', '4'].includes(cleanText);
    const hasTrigger = TRIGGER_WORDS.some(word => cleanText.includes(word));
    const isFollowUp = FOLLOW_UP_PHRASES.some(phrase => cleanText.includes(phrase));
    const isGreetingOnly = ['hola', 'buenas', 'hey', 'buenos dias', 'buenos días', 'buenas tardes'].includes(cleanText);

    // Si es solo saludo -> Silencio (según requisito)
    if (isGreetingOnly && !isMenuOption && !hasTrigger && !isFollowUp) {
        return;
    }

    // ¿Ya hay una conversación activa?
    const isConversationActive = CONVERSATION_HISTORY[remoteJid].serviceSelected !== null;

    // Regla de Silencio Total:
    // No respondemos si no hay intención clara, ni seguimiento, ni opción de menú.
    if (!isMenuOption && !hasTrigger && !isFollowUp && !isConversationActive) {
        return;
    }

    // Respuestas numéricas (Menú)
    if (RESPONSES[cleanText]) {
        await sock.sendPresenceUpdate('composing', remoteJid);
        await delay(1500);
        await sock.sendMessage(remoteJid, { text: RESPONSES[cleanText] });

        const serviceNames = { '1': 'Servicios y Tecnologías', '2': 'Precios', '3': 'Comprar Productos', '4': 'Agendar' };
        CONVERSATION_HISTORY[remoteJid].serviceSelected = serviceNames[cleanText];
        CONVERSATION_HISTORY[remoteJid].flowLevel = 'detalles';

        CONVERSATION_HISTORY[remoteJid].messages.push({ role: 'user', content: text });
        CONVERSATION_HISTORY[remoteJid].messages.push({ role: 'assistant', content: RESPONSES[cleanText] });
        return;
    }

    // Inteligencia Artificial (OpenAI)
    try {
        // Ignorar si menciona chatgpt
        if (cleanText.includes('chatgpt')) return;

        await sock.sendPresenceUpdate('composing', remoteJid);

        const currentState = {
            servicioActual: CONVERSATION_HISTORY[remoteJid].serviceSelected,
            etapaDelFlujo: CONVERSATION_HISTORY[remoteJid].flowLevel
        };

        const aiResponse = await getAIResponse(text, CONVERSATION_HISTORY[remoteJid].messages, currentState);

        if (aiResponse.includes('IGNORAR_MENSAJE')) {
            return;
        }

        await sock.sendMessage(remoteJid, { text: aiResponse });

        CONVERSATION_HISTORY[remoteJid].messages.push({ role: 'user', content: text });
        CONVERSATION_HISTORY[remoteJid].messages.push({ role: 'assistant', content: aiResponse });

        if (CONVERSATION_HISTORY[remoteJid].messages.length > 6) {
            CONVERSATION_HISTORY[remoteJid].messages = CONVERSATION_HISTORY[remoteJid].messages.slice(-6);
        }

    } catch (error) {
        console.error('Error en AI Fallback:', error);
    }
}

module.exports = { handleMessage };
