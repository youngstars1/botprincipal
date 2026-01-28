const OpenAI = require('openai');
const { BUSINESS_CONTEXT } = require('./context');

/**
 * Servicio de IA usando OpenAI (ChatGPT)
 * @param {String} userMessage - Mensaje del usuario
 * @param {String} conversationHistory - Historial opcional de conversación
 * @returns {String} - Respuesta generada por ChatGPT
 */
async function getAIResponse(userMessage, conversationHistory = '') {
    try {
        // Validar que existe la API Key
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ OPENAI_API_KEY no está configurada en .env');
            return `Disculpa, el sistema de IA no está configurado. 😅\n\n¿Podrías escribir "menu" para ver las opciones disponibles?`;
        }

        // Inicializar OpenAI
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Construir el mensaje con contexto
        const systemPrompt = `${BUSINESS_CONTEXT}

Eres un asistente conversacional de WhatsApp. Responde de forma profesional, breve (máximo 3-4 párrafos) y enfocada en ayudar al cliente.
Si la pregunta es sobre precios específicos o proyectos complejos, sugiere contactar para una cotización personalizada.`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Agregar historial si existe
        if (conversationHistory) {
            messages.push({ role: 'assistant', content: conversationHistory });
        }

        // Agregar pregunta del usuario
        messages.push({ role: 'user', content: userMessage });

        console.log('🤖 Consultando a ChatGPT...');

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        console.log('✅ ChatGPT respondió correctamente');
        return response.trim();

    } catch (error) {
        console.error('❌ Error llamando a OpenAI:', error.message);
        console.error('Detalles completos:', error);

        // Respuesta de fallback si falla la IA
        return `Disculpa, estoy teniendo problemas técnicos en este momento. 😅\n\n¿Podrías escribir "menu" para ver las opciones disponibles, o espera un momento y un miembro del equipo te atenderá?`;
    }
}

module.exports = { getAIResponse };
