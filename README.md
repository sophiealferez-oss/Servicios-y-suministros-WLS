# Servicios y Suministros WLS - Landing Page

Landing page profesional para Servicios y Suministros WLS, empresa dedicada al alquiler de maquinaria pesada con 30 años de experiencia en Acacías, Meta, Colombia.

## Descripción del Proyecto

Esta landing page ha sido diseñada con un enfoque profesional y corporativo para representar adecuadamente la marca Servicios y Suministros WLS. La página incluye todas las secciones necesarias para mostrar los servicios, maquinaria disponible y facilitar el contacto con los clientes potenciales.

## Características Principales

- **Diseño Responsivo**: Compatible con dispositivos móviles, tablets y escritorio
- **Navegación Sticky**: Barra lateral fija que permanece visible al hacer scroll
- **Animaciones Sutiles**: Efectos de transición y aparición al hacer scroll
- **Formulario de Contacto**: Con validación básica de campos requeridos
- **Menú Móvil**: Menú hamburguesa para dispositivos móviles
- **Botón de WhatsApp Flotante**: Acceso rápido al contacto por WhatsApp
- **Carrusel de Maquinaria**: Sistema interactivo que muestra dos tarjetas de maquinaria por slide

## Estructura de la Página

1. **Hero**: Sección inicial con imagen de fondo impactante y botones de acción
2. **Sobre Nosotros**: Información sobre la empresa y sus estadísticas clave
3. **Maquinaria Disponible**: Carrusel interactivo que muestra dos tarjetas de maquinaria por slide
4. **Servicios**: Detalle de los servicios ofrecidos en formato de tarjetas
5. **Contacto**: Formulario de contacto y datos de información

## Tecnologías Utilizadas

- HTML5
- CSS3 (con Grid y Flexbox)
- JavaScript ES6 (sin frameworks externos)
- Google Fonts (fuente Poppins)
- Sistema de carrusel personalizado con CSS y JavaScript

## Archivos del Proyecto

- `index.html`: Estructura principal de la página
- `styles.css`: Hoja de estilos con comentarios detallados
- `script.js`: Funcionalidad interactiva (menú móvil, scroll suave, validación de formulario)
- `README.md`: Documentación del proyecto

## Instalación y Uso

1. Clona o descarga los archivos en tu directorio local
2. Abre `index.html` en tu navegador web
3. Personaliza el contenido según tus necesidades

## Personalización

### Cambiar Imágenes
Reemplaza las imágenes de placeholder con imágenes reales de tu negocio:
- Imagen de hero: Actualiza la URL en la propiedad `background-image` de la clase `.hero`
- Imágenes de carrusel: Reemplaza las URLs en la sección de maquinaria disponible (ahora en formato de carrusel)

### Personalizar el Carrusel
- Modificar el número de tarjetas por slide: Edita la estructura HTML en la sección de maquinaria disponible
- Ajustar el tiempo de auto-desplazamiento: Cambia el valor en milisegundos en la línea `setInterval(nextSlide, 5000)` en `script.js`
- Cambiar estilos del carrusel: Modifica las clases CSS que empiezan con `.carousel-`

### Contenido
Modifica el texto en `index.html` para reflejar la información específica de tu negocio:
- Textos descriptivos
- Datos de contacto
- Tipos de maquinaria
- Servicios específicos

### Colores y Estilos
Actualiza las variables de color en `styles.css`:
- Color primario: `#0066cc`
- Colores de fondo y texto según la identidad corporativa

## Validación de Formulario

El formulario de contacto incluye validación básica:
- Campos nombre y email son obligatorios
- Validación de formato de email
- Mensaje de confirmación al enviar

## Optimización SEO

La página incluye etiquetas meta importantes:
- Etiqueta title descriptiva
- Meta description
- Etiquetas Open Graph para redes sociales
- Estructura semántica HTML

## Compatibilidad

- Chrome, Firefox, Safari, Edge (versiones modernas)
- Dispositivos móviles y tablets
- Accesibilidad básica implementada

## Configuración de EmailJS

Para que el formulario de contacto funcione correctamente, debes configurar EmailJS siguiendo estos pasos:

1. Crea una cuenta en [https://www.emailjs.com/](https://www.emailjs.com/)
2. Conecta tu proveedor de correo (Gmail, Outlook, etc.)
3. Crea un template con ID `template_wls_contact` con los siguientes campos:
   - `from_name` - Nombre del cliente
   - `from_email` - Email del cliente
   - `from_phone` - Teléfono del cliente
   - `machine_type` - Tipo de maquinaria solicitada
   - `message` - Mensaje del cliente
   - `to_email` - Email de destino (opcional)

4. Actualiza tu Service ID en el archivo `script.js` si es diferente de "gmail"

## Sistema de Autenticación

El proyecto incluye un sistema de autenticación completo para gestionar usuarios y cotizaciones:

### Características del Sistema de Autenticación

- **Registro de Usuarios**: Permite a nuevos clientes registrarse con email/usuario y contraseña
- **Inicio de Sesión Seguro**: Con verificación de credenciales y tokens JWT
- **Gestión de Cotizaciones**: Los usuarios pueden guardar sus solicitudes de cotización en su cuenta
- **Seguridad**: Contraseñas encriptadas con bcrypt y tokens expirables

### Componentes del Sistema

#### Backend (Servidor)
- Servidor creado con **Node.js y Express**
- Base de datos que puede usar **MongoDB o almacenamiento en memoria** (para pruebas)
- **Encriptación de contraseñas** usando **bcrypt**
- **Tokens JWT** para autenticación segura

#### Frontend (Interfaz Web)
- **Cuadros de diálogo** para login/registro que aparecen al hacer clic
- **Botones de autenticación** en el encabezado de la página
- **Integración con el formulario de contacto**: cuando un usuario está logueado, las cotizaciones se guardan en su cuenta

#### Funcionalidades
- Registro e inicio de sesión de usuarios
- Cierre de sesión seguro
- Guardado de cotizaciones asociadas al usuario
- Visualización de cotizaciones previas (próximamente)

### Archivos del Sistema de Autenticación

- `server.js`: Servidor backend principal
- `.env`: Configuración del entorno
- `config/db.js`: Configuración de base de datos
- `routes/auth.js`: Rutas de autenticación (registro/inicio de sesión)
- `routes/quotation.js`: Rutas para manejo de cotizaciones
- `middleware/auth.js`: Middleware de autenticación JWT
- `models/User.js`: Modelo de usuario
- `models/Quotation.js`: Modelo de cotización

### Configuración del Servidor

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor backend:
   ```bash
   npm run dev
   ```
   El servidor se iniciará en `http://localhost:3000`

3. Abre `index.html` usando un servidor local (como Live Server en VS Code)

### Seguridad Implementada

- Contraseñas **encriptadas** antes de guardarlas
- **Tokens expirables** para mayor seguridad
- **Validación de entradas** para prevenir inyecciones maliciosas
- **Rutas protegidas** que requieren autenticación

## Licencias

Este código es de uso libre y puede ser modificado según las necesidades del proyecto.