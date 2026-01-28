# Bot de Atención al Cliente para Diseño Web

Este bot automatizado está construido con Node.js y `@whiskeysockets/baileys` para ofrecer una conexión estable y persistente.

## Características

- 💾 **Persistencia de Sesión Real**: No necesitas escanear el QR cada vez que reinicias. La sesión se guarda en `auth_info_baileys`.
- 🤖 **Flujo de Ventas**: Responde a servicios de Diseño Web, Tiendas y Hosting.
- 🧠 **Integración con Gemini AI**: Respuestas inteligentes a preguntas no previstas usando IA de Google.
- ⏳ **Simulación Humana**: Incluye delays de escritura ("Escribiendo...") para sentirse natural.
- 🔄 **Reconexión Automática**: Maneja caídas de internet o desconexiones temporales.
- 👮 **Modo Admin**: Envíale `!status` al bot para verificar su estado.

## Instalación

1.  Asegúrate de estar en la carpeta del proyecto:
    ```bash
    cd customer-bot
    ```

2.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```

3.  Configura el `.env`:
    - Abre el archivo `.env`.
    - Cambia `ADMIN_NUMBER` por tu número de teléfono (formato internacional sin `+`, ej: `5215512345678`).
    - La API key de Gemini ya está configurada. Si quieres usar otra, cámbiala en `GEMINI_API_KEY`.

4.  **Personaliza el contexto de negocio**:
    - Edita `src/services/context.js` con la información real de tu negocio, servicios y precios.

## Ejecución

Para iniciar el bot:

```bash
npm start
```

La primera vez verás un código QR en la terminal. Escanéalo con WhatsApp (Dispositivos Vinculados).

## Estructura del Proyecto

- `app.js`: Archivo principal de conexión.
- `src/services/botLogic.js`: Aquí puedes editar los textos y menús.
- `src/services/context.js`: **IMPORTANTE** - Contexto de negocio para Gemini AI (personalízalo con tus datos).
- `src/services/geminiService.js`: Conexión con la API de Gemini.
- `src/config.js`: Configuración del sistema.
- `auth_info_baileys/`: Carpeta donde se guardan tus credenciales (¡No la borres a menos que quieras cerrar sesión!).

## Cómo Funciona

1. **Menú Principal**: Respuestas rápidas y predefinidas (opciones 1, 2, 3)
2. **Gemini AI**: Si el cliente pregunta algo fuera del menú, Gemini responde de forma inteligente usando el contexto de tu negocio
3. **Comandos Admin**: Escribe `!status` para ver el estado del bot (solo funciona desde tu número)
