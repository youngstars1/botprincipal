const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { SESSION_PATH, RECONNECT_INTERVAL } = require('./src/config');
const { handleMessage } = require('./src/services/botLogic');
const { delay } = require('./src/utils');

// Asegurar ruta absoluta para persistencia en Railway/Docker
const AUTH_PATH = path.isAbsolute(SESSION_PATH) ? SESSION_PATH : path.join(process.cwd(), SESSION_PATH);

// Servidor web básico para Railway (Health Check)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('YoungStars Bot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor de salud activo en puerto ${PORT}`);
});

/**
 * Función principal para iniciar el bot
 */
async function startBot() {
    console.log(`\n🤖 Iniciando YoungStars AI...`);

    // Validar carpeta de sesión
    if (!fs.existsSync(AUTH_PATH)) {
        fs.mkdirSync(AUTH_PATH, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`📦 Baileys v${version.join('.')} (Latest: ${isLatest})`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'error' }), // Cambiado de silent a error para ver fallos reales
        auth: state,
        // Usar un navegador estándar sin carácteres especiales para mayor estabilidad
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        // Evita que la sesión se cierre por inactividad del socket
        keepAliveIntervalMs: 30000,
        markOnline: true
    });

    // Guardar credenciales de forma asíncrona y segura
    sock.ev.on('creds.update', async () => {
        try {
            await saveCreds();
        } catch (err) {
            console.error('❌ Error guardando credenciales:', err);
        }
    });

    // Gestión de conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n┌──────────────────────────────────────┐');
            console.log('│  ⚡ ESCANEA EL QR PARA CONECTAR ⚡   │');
            console.log('└──────────────────────────────────────┘\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            const reason = lastDisconnect?.error?.message || 'Razón desconocida';

            console.warn(`\n⚠️ Conexión cerrada. Código: ${statusCode}. Motivo: ${reason}`);

            if (shouldReconnect) {
                console.log(`🔄 Reconectando en ${RECONNECT_INTERVAL / 1000}s...`);
                setTimeout(() => startBot(), RECONNECT_INTERVAL);
            } else {
                console.error('❌ Sesión cerrada por WhatsApp (Logout). Limpiando datos...');
                if (fs.existsSync(AUTH_PATH)) {
                    fs.rmSync(AUTH_PATH, { recursive: true, force: true });
                }
                console.log('✅ Carpeta de sesión eliminada. Reinicia para generar nuevo QR.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('\n✅ ¡BOT CONECTADO Y ONLINE!');
            console.log('🚀 Listo para recibir mensajes.\n');
        }
    });

    // Recepción de mensajes
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            try {
                if (!msg.message || msg.key.fromMe) continue;

                const text = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption;

                if (text) {
                    await handleMessage(sock, msg, text);
                }
            } catch (err) {
                console.error('❌ Error procesando mensaje:', err);
            }
        }
    });

    // Manejo de errores globales corregido
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', (err) => {
        console.error('🔥 Error Crítico:', err);
        if (err.message.includes('EPIPE') || err.message.includes('ECONNRESET')) {
            console.log('Retrying connection due to network error...');
        }
    });
}

// Iniciar
startBot().catch(err => console.error('Error fatal al iniciar:', err));

