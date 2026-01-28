# 🚀 Desplegar YoungStars Design AI en Railway

## ✅ Requisitos previos
- [ ] Cuenta de GitHub
- [ ] Cuenta de Railway
- [ ] API Key de OpenAI con créditos

---

## 📋 **Pasos para desplegar:**

### **1. Crear repositorio en GitHub**

1. Ve a: https://github.com/new
2. Nombre del repo: `youngstars-whatsapp-bot` (o el que prefieras)
3. **Privado** (importante para proteger tus datos)
4. NO agregues README, .gitignore ni license
5. Click en "Create repository"

### **2. Subir el código a GitHub**

Ejecuta en tu terminal:

```bash
git init
git add .
git commit -m "Bot WhatsApp YoungStars con ChatGPT"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/youngstars-whatsapp-bot.git
git push -u origin main
```

### **3. Crear cuenta en Railway**

1. Ve a: https://railway.app
2. Click en "Login with GitHub"
3. Autoriza Railway

### **4. Crear nuevo proyecto**

1. En Railway, click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Elige tu repositorio `youngstars-whatsapp-bot`
4. Railway detectará automáticamente que es Node.js

### **5. Configurar Variables de Entorno**

En Railway, ve a tu proyecto → **Variables**:

Agrega estas variables:

```
ADMIN_NUMBER=5211234567890
SESSION_PATH=./auth_info_baileys
BOT_NAME=YoungStars Design AI
OPENAI_API_KEY=tu_clave_de_openai_aqui
```

⚠️ **Reemplaza con tu número de admin real**

### **6. Ver los Logs**

1. Ve a tu proyecto en Railway
2. Click en "Deployments"
3. Click en el deployment activo
4. Verás los logs en tiempo real
5. **Busca el QR** en los logs y escanéalo con WhatsApp

### **7. Escanear QR**

⚠️ **IMPORTANTE**: 
- El QR aparecerá en los LOGS de Railway (no en terminal local)
- Tendrás que escanear un nuevo QR cada vez que Railway reinicie el bot
- Para QR persistente, necesitas VPS

---

## 📊 **Monitoreo de Costos**

- Railway te da **$5 USD gratis** cada mes
- Tu bot gastará aproximadamente **$5-8 USD/mes**
- Puedes ver el uso en: Railway Dashboard → Usage

---

## 🔄 **Actualizaciones futuras**

Cuando hagas cambios al código:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Railway re-desplegará automáticamente.

---

## ⚠️ **Limitaciones**

1. **Sesión de WhatsApp NO es persistente**
   - Se borra cada vez que Railway reinicia
   - Tendrás que escanear el QR de nuevo

2. **Solución**: Para sesión persistente, necesitas VPS

---

## 🆘 **Problemas comunes**

### El bot no inicia
- Revisa los logs en Railway
- Verifica que las variables de entorno estén correctas

### No veo el QR
- El QR aparece en los LOGS de Railway
- Ve a: Deployments → Click en el deployment → View Logs

### Bot desconectado
- Railway reinicia periódicamente
- Escanea el QR de nuevo en los logs

---

**¿Listo para producción seria?** Considera migrar a VPS de Hostinger ($5/mes).
