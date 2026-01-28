const OpenAI = require('openai');
const { BUSINESS_CONTEXT } = require('./context');

/**
 * Servicio de IA para respuestas inteligentes (OpenAI)
 * @param {String} userMessage - Mensaje del usuario
 * @param {Array} conversationHistory - Historial de conversación {role, content}
 * @param {Object} currentState - {servicioActual, etapaDelFlujo}
 */
async function getAIResponse(userMessage, conversationHistory = [], currentState = {}) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return `Disculpa, el sistema de IA no está configurado.`;
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const systemPrompt = `${BUSINESS_CONTEXT}

# ESTADO ACTUAL DE LA CONVERSACIÓN
- Servicio Seleccionado: ${currentState.servicioActual || 'Ninguno aún'}
- Etapa del Flujo: ${currentState.etapaDelFlujo || 'Inicio'}

# REGLAS DE ORO (ESTRICTO):
1. Eres youngAI 🕵️‍♀️🤖. NUNCA menciones a ChatGPT o OpenAI.
2. Si el usuario pregunta algo AJENO a los servicios de YoungStars Design (fútbol, cocina, política, o simplemente tonterías), responde ÚNICAMENTE con la palabra: IGNORAR_MENSAJE.
3. Si el usuario pregunta "¿quién eres?" o algo similar, responde como youngAI 🕵️‍♀️🤖 y ofrece el menú.
4. Tu objetivo es convertir al usuario en cliente. Sigue el flujo del servicio seleccionado.
5. Máximo 2-3 párrafos cortos. No seas pesado.`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Añadir historial si existe
        if (Array.isArray(conversationHistory)) {
            messages.push(...conversationHistory);
        }

        // Añadir mensaje actual
        messages.push({ role: 'user', content: userMessage });

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        const responseText = completion.choices[0].message.content;
        return responseText;

    } catch (error) {
        console.error('Error en getAIResponse:', error);
        return 'IGNORAR_MENSAJE'; // Por seguridad ante error, ignoramos
    }
}

module.exports = { getAIResponse };
