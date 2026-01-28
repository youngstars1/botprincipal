const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const http = require('http');
const { SESSION_PATH, RECONNECT_INTERVAL } = require('./src/config');
const { handleMessage } = require('./src/services/botLogic');
const { delay } = require('./src/utils');

// Servidor web básico para Railway (Health Check)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('YoungStars Bot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`📡 Servidor de salud activo en puerto ${PORT}`);
});

// Función principal asíncrona
async function startBot() {
    console.log(`\n🤖 Iniciando Bot de Atención al Cliente...`);
    console.log(`📂 Ruta de sesión: ${SESSION_PATH}`);

    // Cargar estado de la sesión (Gestión automática de persistencia en sistema de archivos)
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`📦 Usando versión de Baileys: v${version.join('.')} (Latest: ${isLatest})`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Log nivel silent para mantener limpia la consola
        // printQRInTerminal: true, // Deprecado en versiones nuevas
        auth: state,
        browser: ['youngAI 🕵️‍♀️🤖', 'Chrome', '1.0.0'], // Nombre visible en WhatsApp Web
        syncFullHistory: false, // Optimización: no sincronizar todo el historial antiguo
        generateHighQualityLinkPreview: true
    });

    // Evento: Actualización de Credenciales
    // CRUCIAL: Guarda las credenciales cada vez que se actualizan para evitar perder la sesión
    sock.ev.on('creds.update', saveCreds);

    // Evento: Actualización de Conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.clear();
            console.log('\n┌──────────────────────────────────────┐');
            console.log('│  ⚡ ESCANEA EL QR PARA CONECTAR ⚡   │');
            console.log('└──────────────────────────────────────┘\n');
            qrcode.generate(qr, { small: true });
            console.log('\n💡 Tip: Si el QR es muy grande, reduce el zoom del terminal (Ctrl + -)');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            const reason = lastDisconnect?.error || 'Desconocido';

            console.warn(`\n⚠️ Conexión cerrada. Razón: ${reason}`);

            if (shouldReconnect) {
                console.log(`🔄 Intentando reconectar en ${RECONNECT_INTERVAL / 1000} segundos...`);
                await delay(RECONNECT_INTERVAL);
                startBot(); // Recursión para reconectar
            } else {
                console.error('❌ Sesión cerrada definitivamente (Logout). Borra la carpeta de sesión y reinicia.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('\n✅ ¡CONEXIÓN ESTABLECIDA! El bot está listo para recibir mensajes.');
            console.log('🤖 Escuchando mensajes entrantes...\n');
        }
    });

    // Evento: Recepción de Mensajes
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type === 'notify') {
                for (const msg of messages) {
                    // Ignorar mensajes enviados por el propio bot para evitar bucles
                    if (!msg.message || msg.key.fromMe) continue;

                    // Extraer los diferentes tipos de texto posible
                    const messageType = Object.keys(msg.message)[0];
                    let text =
                        msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.imageMessage?.caption;

                    if (text) {
                        // Procesar lógica de negocio
                        await handleMessage(sock, msg, text);
                    }
                }
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });

    // Manejo de errores globales para evitar caídas
    process.on('uncaughtException', (err) => {
        console.error('🔥 Error Crítico no Controlado:', err);
        // Opcional: reiniciar si es crítico
    });
}

// Iniciar aplicación
startBot().catch(err => console.error('Error al iniciar bot:', err));
