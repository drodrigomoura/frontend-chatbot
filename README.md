# 🤖 Frontend Chatbot - Rasa 3.6.20

Un frontend moderno y responsive para tu chatbot de Rasa 3.6.20. Esta aplicación React proporciona una interfaz de usuario elegante y funcional para interactuar con tu bot de Rasa.

## ✨ Características

- 🎨 **Interfaz moderna**: Diseño responsive con gradientes y efectos visuales
- 🔧 **Configuración dinámica**: Cambia la URL de Rasa sin reiniciar
- 📊 **Monitoreo en tiempo real**: Indicador de estado de conexión
- 📱 **Responsive**: Funciona perfectamente en desktop y móvil
- ⚡ **Rápido**: Optimizado para rendimiento

## 🚀 Instalación

1. **Clona el repositorio**:

```bash
git clone <tu-repositorio>
cd frontend-chatbot
```

2. **Instala las dependencias**:

```bash
npm install
```

3. **Inicia el servidor de desarrollo**:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Configuración

### Variables de Entorno

**Para desarrollo local:**

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus credenciales de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

**Para producción:**

- Configura las variables en tu plataforma de hosting (Vercel, Netlify, etc.)
- O edita el archivo `.env` con las credenciales de producción

**Obtener credenciales de Supabase:**

1. Ve a [supabase.com](https://supabase.com)
2. Accede a tu proyecto → Settings → API
3. Copia: Project URL y anon/public key

### Configuración del Frontend

El frontend se conecta por defecto a `http://localhost:5500`. Puedes cambiar esta URL desde la interfaz de usuario o modificando el archivo de configuración.

## 📖 Uso

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run format` - Formatea el código con Biome
- `npm run check` - Verifica el código con Biome

## 📁 Estructura del Proyecto

```
frontend-chatbot/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Auth.css         # Estilos de autenticación
│   │   │   ├── AuthModal.tsx    # Modal de autenticación
│   │   │   ├── LoginForm.tsx    # Formulario de login
│   │   │   └── UserProfile.tsx  # Perfil de usuario
│   │   ├── ChatWidget.tsx       # Widget de chat personalizado
│   │   └── ChatWidget.css       # Estilos del widget
│   ├── config/
│   │   └── supabase.ts          # Configuración de Supabase
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   ├── App.tsx                  # Componente principal
│   ├── App.css                  # Estilos principales
│   └── index.jsx                # Punto de entrada
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de variables de entorno
├── package.json
├── package-lock.json
├── rsbuild.config.mjs           # Configuración de Rsbuild
├── tsconfig.json                # Configuración de TypeScript
└── biome.json                   # Configuración de Biome
```

## 🔍 Solución de Problemas

### El chatbot no se conecta

1. **Verifica que Rasa esté ejecutándose**:

```bash
curl http://localhost:5500/webhooks/rest/webhook
```

2. **Revisa los logs de Rasa**:

```bash
rasa run --enable-api --cors "*" --port 5500 --debug
```

3. **Verifica la configuración CORS** en tu `credentials.yml`:

```yaml
rest:
  webhook_url: "http://localhost:5500/webhooks/rest/webhook"
  cors_origins:
    - "http://localhost:3000"
```

### El widget no aparece

1. **Verifica la consola del navegador** para errores
2. **Asegúrate de que `socket.io-client` esté instalado**:

```bash
npm install socket.io-client
```

3. **Verifica la configuración de Socket.IO** en tu `credentials.yml`

### Problemas de rendimiento

1. **Limpia el historial** si tiene muchos mensajes
2. **Verifica la conexión a internet** si usas CDNs externos
3. **Optimiza las imágenes** del avatar del bot

## 🚀 Despliegue

### Producción

1. **Construye la aplicación**:

```bash
npm run build
```

2. **Configura las variables de entorno**:

```bash
REACT_APP_RASA_URL=https://tu-servidor-rasa.com
```

3. **Sirve los archivos estáticos** desde la carpeta `dist/`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
