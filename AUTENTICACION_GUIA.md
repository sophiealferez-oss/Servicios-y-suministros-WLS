# Guía para Probar la Autenticación

## ✅ Implementación Completada

Se ha implementado el sistema de autenticación completo en tu landing page con:

1. **Backend** (`server.js`, `routes/auth.js`, `models/User.js`):
   - Registro de usuarios (`POST /api/auth/register`)
   - Login de usuarios (`POST /api/auth/login`)
   - Autenticación con JWT tokens
   - Base de datos en memoria (para testing) o MongoDB

2. **Frontend** (`index.html`, `script.js`, `styles.css`):
   - Botones de "Iniciar Sesión" y "Registrarse" en el menú lateral
   - Modales para Login y Registro
   - Validación de formularios
   - Persistencia de sesión con localStorage
   - UI actualizada según el estado del usuario

## 🚀 Cómo Probar la Autenticación

### Paso 1: Iniciar el Servidor

El servidor ya está ejecutándose en `http://localhost:3000`. Si necesitas reiniciarlo:

```bash
cd C:\Users\emmanuel\Desktop\Servicios-y-suministros-WLS
node server.js
```

### Paso 2: Abrir la Página Web

Abre el archivo `index.html` en tu navegador:

```
C:\Users\emmanuel\Desktop\Servicios-y-suministros-WLS\index.html
```

O usa un servidor local:
```bash
# Opción 1: Usar Live Server en VS Code (recomendado)
# Click derecho en index.html -> "Open with Live Server"

# Opción 2: Usar http-server de npm
npx http-server -p 8080
# Luego abre: http://localhost:8080
```

### Paso 3: Probar el Registro

1. Haz clic en el botón **"Registrarse"** en el menú lateral izquierdo
2. Completa el formulario:
   - **Nombre de usuario**: Ej. `juanperez`
   - **Email**: Ej. `juan@email.com`
   - **Contraseña**: Mínimo 6 caracteres, Ej. `123456`
3. Haz clic en **"Registrarse"**
4. Deberías ver un mensaje de éxito y tu nombre de usuario en el menú

### Paso 4: Probar el Login

1. Si ya estás registrado, haz clic en **"Cerrar Sesión"**
2. Haz clic en **"Iniciar Sesión"**
3. Ingresa tus credenciales:
   - **Email**: El que usaste al registrarte
   - **Contraseña**: Tu contraseña
4. Haz clic en **"Ingresar"**
5. Deberías ver tu nombre de usuario en el menú lateral

### Paso 5: Verificar la Persistencia

1. Recarga la página (F5)
2. Tu sesión debería mantenerse activa
3. El nombre de usuario debería seguir visible

## 🧪 Pruebas Rápidas con cURL

### Registrar un usuario:
```bash
curl http://localhost:3000/api/auth/register -X POST -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@email.com\",\"password\":\"123456\"}"
```

### Iniciar sesión:
```bash
curl http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@email.com\",\"password\":\"123456\"}"
```

## 📋 Características Implementadas

### UI/UX:
- ✅ Botones de autenticación en el menú lateral
- ✅ Modales emergentes para Login y Registro
- ✅ Transición suave entre Login y Registro
- ✅ Mostrar nombre del usuario cuando está logueado
- ✅ Botón de Cerrar Sesión
- ✅ Diseño responsivo para móviles

### Funcionalidad:
- ✅ Registro de nuevos usuarios
- ✅ Login con email y contraseña
- ✅ Validación de formularios (cliente y servidor)
- ✅ Tokens JWT para autenticación
- ✅ Persistencia de sesión con localStorage
- ✅ Cierre de sesión

### Seguridad:
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración (24h)
- ✅ Validación de longitud de contraseña (mínimo 6 caracteres)
- ✅ Validación de email

## 🔧 Configuración

El archivo `.env` contiene:
- `USE_IN_MEMORY_DB=true` - Usa base de datos en memoria (ideal para testing)
- `JWT_SECRET` - Clave secreta para los tokens JWT
- `PORT=3000` - Puerto del servidor

**Nota:** Con la base de datos en memoria, los usuarios se pierden al reiniciar el servidor. Para producción, configura MongoDB cambiando `USE_IN_MEMORY_DB=false` y estableciendo `MONGODB_URI`.

## 🐛 Solución de Problemas

### "Error de conexión"
- Verifica que el servidor esté ejecutándose (`node server.js`)
- Abre la consola del navegador (F12) para ver errores

### "Invalid credentials"
- Verifica que el usuario esté registrado
- Las credenciales son case-sensitive

### Los modales no aparecen
- Abre la consola del navegador (F12) para ver errores de JavaScript
- Verifica que `script.js` se cargue correctamente

### El servidor no inicia
- Ejecuta `npm install` para instalar dependencias
- Verifica que el puerto 3000 no esté en uso
