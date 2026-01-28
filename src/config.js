require('dotenv').config();
const path = require('path');

module.exports = {
    // Número del admin para comandos especiales (formato internacional sin + ni espacios, ej: 573001234567)
    ADMIN_NUMBER: process.env.ADMIN_NUMBER,
    // Ruta donde se guardarán las credenciales de sesión
    SESSION_PATH: process.env.SESSION_PATH || './auth_info_baileys',
    // Nombre del bot para logs
    BOT_NAME: process.env.BOT_NAME || 'Design Bot',
    // Intervalo de intentos de reconexión
    RECONNECT_INTERVAL: 3000,
    // Máximos intentos antes de fallar (aunque la lógica de reconexión suele ser infinita en producción, seguiremos el requisito)
    MAX_RECONNECT_RETRIES: 3,
    // API Key de OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
