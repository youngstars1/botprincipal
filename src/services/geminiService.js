const { GoogleGenerativeAI } = require('@google/generative-ai');
const { BUSINESS_CONTEXT } = require('./context');

/**
 * Servicio de IA para respuestas inteligentes
 * @param {String} userMessage - Mensaje del usuario
 * @param {String} conversationHistory - Historial opcional de conversación
 * @returns {String} - Respuesta generada por Gemini
 */
async function getAIResponse(userMessage, conversationHistory = '') {
    try {
        // Validar que existe la API Key
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY no está configurada en .env');
            return `Disculpa, el sistema de IA no está configurado. 😅\n\n¿Podrías escribir "menu" para ver las opciones disponibles?`;
        }

        // Inicializar Gemini con la API Key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Construir el prompt con contexto
        const prompt = `
${BUSINESS_CONTEXT}

---

${conversationHistory ? `Historial de conversación:\n${conversationHistory}\n\n` : ''}

Cliente pregunta: "${userMessage}"

Responde de forma profesional, breve (máximo 3-4 párrafos) y enfocada en ayudar al cliente.
Si la pregunta es sobre precios específicos o proyectos complejos, sugiere contactar para una cotización personalizada.
`;

        console.log('🤖 Consultando a Gemini AI...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini respondió correctamente');
        return text.trim();

    } catch (error) {
        console.error('❌ Error llamando a Gemini AI:', error.message);
        console.error('Detalles completos:', error);

        // Respuesta de fallback si falla la IA
        return `Disculpa, estoy teniendo problemas técnicos en este momento. 😅\n\n¿Podrías escribir "menu" para ver las opciones disponibles, o espera un momento y un miembro del equipo te atenderá?`;
    }
}

module.exports = { getAIResponse };
