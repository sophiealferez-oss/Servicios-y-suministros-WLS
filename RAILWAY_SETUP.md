# Guía de Despliegue en Railway

Esta guía te ayudará a desplegar tu aplicación de Servicios y Suministros WLS en Railway.

## Pasos para desplegar en Railway

### 1. Crear un nuevo proyecto en Railway

1. Ve a [railway.app](https://railway.app/)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Conecta tu repositorio `Servicios-y-suministros-WLS`

### 2. Agregar la base de datos PostgreSQL

1. En tu proyecto de Railway, haz clic en **"New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. La variable de entorno `DATABASE_URL` se agregará automáticamente

### 3. Configurar variables de entorno

En la sección **"Variables"** de tu proyecto en Railway, asegúrate de tener:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (automático de Railway) |
| `JWT_SECRET` | `tu_secreto_muy_seguro_aqui_cambia_esto` (cámbialo por uno seguro) |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | (automático de Railway, no es necesario agregarlo) |

### 4. Desplegar

1. Railway detectará automáticamente que es un proyecto Node.js
2. El despliegue comenzará automáticamente
3. Puedes ver los logs en la pestaña **"Deployments"**

### 5. Acceder a tu aplicación

1. Una vez completado el despliegue, Railway te dará una URL pública
2. Formato: `https://tu-proyecto.railway.app`
3. ¡Tu aplicación estará accesible desde cualquier dispositivo!

## Notas importantes

### Base de datos

- Railway maneja automáticamente la conexión SSL a PostgreSQL
- No es necesario agregar `?sslmode=require` a la `DATABASE_URL`
- Los modelos se sincronizarán automáticamente al iniciar

### CORS

El servidor ya está configurado con CORS habilitado para aceptar conexiones desde cualquier origen. Si quieres restringir el acceso, modifica `server.js`:

```javascript
app.use(cors({
  origin: 'https://tu-dominio.com'
}));
```

### Reinicios

- Railway reiniciará automáticamente tu aplicación si falla (`restartPolicyType: ON_FAILURE`)
- Los reinicios se intentarán hasta 3 veces (`restartPolicyMaxRetries: 3`)

## Solución de problemas

### Error de conexión a la base de datos

1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Asegúrate de que PostgreSQL esté provisionado en Railway
3. Revisa los logs en la pestaña **"Deployments"**

### La aplicación no responde

1. Verifica que `HOST=0.0.0.0` esté configurado
2. Revisa que el puerto correcto esté siendo usado (Railway asigna uno automáticamente)
3. Revisa los logs de errores

### Errores de autenticación

1. Asegúrate de que `JWT_SECRET` esté configurado
2. Verifica que los usuarios puedan registrarse correctamente

## Variables de entorno locales

Para desarrollo local, crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales locales.

## Comandos útiles

```bash
# Desarrollo local
npm run dev

# Producción local
npm start

# Instalar dependencias
npm install
```
