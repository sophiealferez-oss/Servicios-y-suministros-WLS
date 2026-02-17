# Guía de Despliegue en Vercel + Neon

Esta guía te ayudará a desplegar tu aplicación de Servicios y Suministros WLS en **Vercel** con base de datos **Neon PostgreSQL**.

## Resumen

| Servicio | Función |
|----------|---------|
| **Vercel** | Hosting del frontend y API serverless |
| **Neon** | Base de datos PostgreSQL en la nube |

---

## Paso 1: Configurar Neon (Base de Datos)

### 1.1 Crear cuenta en Neon

1. Ve a [https://neon.tech](https://neon.tech)
2. Haz clic en **"Sign Up"** (puedes usar GitHub, Google o email)
3. Completa el registro

### 1.2 Crear proyecto de base de datos

1. En el dashboard de Neon, haz clic en **"New Project"**
2. Nombra tu proyecto: `Servicios-WLS`
3. Selecciona la región más cercana a tus usuarios (ej: **us-east-1** para Colombia)
4. Haz clic en **"Create Project"**

### 1.3 Obtener DATABASE_URL

1. En la página del proyecto, busca la sección **"Connection Details"**
2. Haz clic en **"Copy Connection String"**
3. El formato será:
   ```
   postgresql://user:password@ep-xxx.region.neon.tech/database?sslmode=require
   ```
4. **Guarda esta URL** - la necesitarás en Vercel

---

## Paso 2: Configurar Vercel

### 2.1 Crear cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** (recomendado con GitHub)
3. Completa el registro

### 2.2 Instalar Vercel CLI (opcional pero recomendado)

```bash
npm i -g vercel
```

### 2.3 Subir proyecto a GitHub

Asegúrate de que tu código esté en GitHub:

```bash
git add .
git commit -m "Configurar para Vercel + Neon"
git push origin main
```

### 2.4 Importar proyecto en Vercel

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio `Servicios-y-suministros-WLS`
3. Haz clic en **"Import"**

### 2.5 Configurar variables de entorno

En la pantalla de configuración del proyecto:

1. Haz clic en **"Environment Variables"**
2. Agrega las siguientes variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | La URL que copiaste de Neon |
| `JWT_SECRET` | Una cadena aleatoria segura (ej: `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |

3. Haz clic en **"Deploy"**

---

## Paso 3: Sincronizar base de datos

### Opción A: Sincronización automática (Recomendada)

La primera vez que despliegues, los modelos se crearán automáticamente en la base de datos.

### Opción B: Sincronización manual local

Si quieres sincronizar desde tu computador:

1. Crea un archivo `.env` en la raíz:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tu `DATABASE_URL` de Neon

3. Ejecuta:
   ```bash
   npm install
   node -e "require('./config/database').connectDB()"
   ```

---

## Paso 4: Verificar despliegue

### 4.1 Acceder a tu aplicación

Vercel te dará una URL como:
```
https://servicios-y-suministros-wls.vercel.app
```

### 4.2 Probar endpoints

- **Homepage**: `https://tu-proyecto.vercel.app/`
- **API Health**: `https://tu-proyecto.vercel.app/api/health`
- **API Test**: `https://tu-proyecto.vercel.app/api/test`

### 4.3 Probar registro

1. Abre tu aplicación en el navegador
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Deberías poder iniciar sesión

---

## Variables de entorno en Vercel

Para agregar o modificar variables después del despliegue:

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Settings"** → **"Environment Variables"**
3. Edita o agrega variables
4. Haz clic en **"Save"**
5. **Redespliega** el proyecto para aplicar cambios

---

## Dominio personalizado (Opcional)

1. En Vercel, ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio (ej: `servicioswls.com`)
3. Configura los DNS en tu proveedor de dominio:
   - **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21`
   - **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`

---

## Solución de problemas

### Error: "DATABASE_URL not configured"

**Solución**: Verifica que la variable `DATABASE_URL` esté configurada en Vercel.

### Error: "SSL connection required"

**Solución**: Asegúrate de que tu `DATABASE_URL` incluya `?sslmode=require`

### Error: "Cannot find module 'sequelize'"

**Solución**: 
```bash
npm install
git push
```

### Los cambios no se reflejan

**Solución**: Forzar un nuevo despliegue:
```bash
vercel --prod
```

### Error de CORS

**Solución**: El API ya está configurada con CORS habilitado. Si necesitas cambiar el origen permitido, edita `api/index.js`:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://tu-dominio.com');
```

---

## Comandos útiles

```bash
# Desarrollo local
npm run dev

# Desplegar en Vercel
vercel

# Desplegar en producción
vercel --prod

# Ver logs
vercel logs

# Abrir dashboard
vercel open
```

---

## Estructura del proyecto

```
Servicios-y-suministros-WLS/
├── api/
│   └── index.js          # API serverless para Vercel
├── config/
│   ├── database.js       # Configuración de Neon
│   └── db.js
├── models/
│   ├── User.js
│   ├── Contact.js
│   └── Quotation.js
├── routes/
│   ├── auth.js
│   ├── contact.js
│   └── quotation.js
├── index.html            # Frontend
├── script.js             # JavaScript del frontend
├── styles.css            # Estilos
├── server.js             # Servidor Express (desarrollo local)
├── vercel.json           # Configuración de Vercel
└── .env.example          # Variables de entorno de ejemplo
```

---

## Notas importantes

### Serverless Functions

- Vercel usa funciones serverless con timeout de 10 segundos
- La conexión a la base de datos se establece en cada request
- Neon está optimizado para este patrón con connection pooling

### Base de datos

- Neon proporciona PostgreSQL con SSL obligatorio
- La URL de conexión incluye automáticamente el modo SSL
- Los modelos se sincronizan en el primer despliegue

### Costos

- **Vercel**: Gratis para proyectos personales
- **Neon**: Gratis hasta 0.5 GB de almacenamiento

---

## Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Neon](https://neon.tech/docs)
- [GitHub del proyecto](https://github.com/sophiealferez-oss/Servicios-y-suministros-WLS)
