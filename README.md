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

## Estructura de la Página

1. **Hero**: Sección inicial con imagen de fondo impactante y botones de acción
2. **Sobre Nosotros**: Información sobre la empresa y sus estadísticas clave
3. **Maquinaria Disponible**: Galería visual de la maquinaria disponible
4. **Servicios**: Detalle de los servicios ofrecidos en formato de tarjetas
5. **Contacto**: Formulario de contacto y datos de información

## Tecnologías Utilizadas

- HTML5
- CSS3 (con Grid y Flexbox)
- JavaScript ES6 (sin frameworks externos)
- Google Fonts (fuente Poppins)

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
- Imágenes de galería: Reemplaza las URLs en la sección de maquinaria disponible

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

## Licencias

Este código es de uso libre y puede ser modificado según las necesidades del proyecto.