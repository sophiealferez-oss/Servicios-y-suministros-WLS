# Configuración de EmailJS para Servicios y Suministros WLS

Para que el formulario de contacto funcione correctamente y envíe los datos al correo `serviciosysuministroswls@gmail.com`, sigue estos pasos:

## 1. Crear cuenta en EmailJS

1. Visita [https://www.emailjs.com/](https://www.emailjs.com/)
2. Regístrate con tu cuenta de Google o crea una cuenta nueva
3. Inicia sesión en tu panel de control

## 2. Conectar proveedor de correo

1. Ve a la sección "Email Services" en tu panel de EmailJS
2. Haz clic en "Add Service"
3. Selecciona tu proveedor de correo (Gmail es común)
4. Sigue las instrucciones para conectar tu cuenta de correo
   - Para Gmail, necesitarás crear una contraseña de aplicación
   - Ve a la configuración de tu cuenta de Google
   - Habilita la verificación en dos pasos
   - Genera una contraseña de aplicación específica para EmailJS

## 3. Crear un template de correo

1. Ve a la sección "Email Templates"
2. Haz clic en "Create New Template"
3. Configura el template con los siguientes valores:
   - **Template ID**: `template_wls_contact`
   - **Subject**: `Nueva solicitud de cotización - Servicios y Suministros WLS`
   - **Content** (usa este HTML como base):
   
```html
<!DOCTYPE html>
<html>
<head>
    <title>Nueva solicitud de cotización</title>
</head>
<body>
    <h2>Nueva solicitud de cotización recibida</h2>
    <p><strong>Nombre:</strong> {{from_name}}</p>
    <p><strong>Email:</strong> {{from_email}}</p>
    <p><strong>Teléfono:</strong> {{from_phone}}</p>
    <p><strong>Tipo de maquinaria:</strong> {{machine_type}}</p>
    <p><strong>Mensaje:</strong></p>
    <p>{{message}}</p>
</body>
</html>
```

4. Guarda el template y aprueba la prueba de envío

## 4. Ya tienes tu Public Key

Según lo indicado, tu Public Key es: `MXUf6SrJdCruo3eHu`
Esta clave ya está incorporada en el archivo script.js

## 5. Alternativa: Usar API Key (REQUIERE CONFIGURACIÓN ADICIONAL)

Si solo tienes una API Key (no la Public Key), puedes usarla, pero ten en cuenta que:

1. Las API Keys no deben usarse directamente en el frontend por razones de seguridad
2. Para usar una API Key en el frontend, necesitarás configurar un proxy o usar un backend
3. Consulta la documentación de EmailJS sobre cómo usar `sendForm` con API Key

## 5. Obtener tu Service ID

1. Ve a la sección "Email Services" en tu panel de EmailJS
2. Identifica el servicio que conectaste (Gmail, Outlook, etc.)
3. Copia el Service ID asociado (por ejemplo: "gmail", "outlook", etc.)

NOTA: El Service ID NO es lo mismo que el Template ID. El Service ID identifica tu proveedor de correo (como Gmail), mientras que el Template ID identifica la plantilla del correo (que en tu caso es "template_wls_contact").

NOTA 2: El Service ID es un identificador técnico (como "gmail", "yahoo", "outlook", etc.), no el nombre de tu empresa ni el nombre del template.

## 6. Actualizar el archivo script.js

1. Abre el archivo `script.js`
2. Ya tienes la Public Key configurada: `MXUf6SrJdCruo3eHu`
3. Busca la línea con `'YOUR_SERVICE_ID_AQUI'` en la función `handleFormSubmit`
4. Reemplaza `'YOUR_SERVICE_ID_AQUI'` con el Service ID real de tu servicio de correo en EmailJS

## 7. Prueba el formulario

Después de completar todos los pasos anteriores, puedes probar el formulario de contacto en tu sitio web para asegurarte de que los mensajes se envían correctamente al correo `serviciosysuministroswls@gmail.com`.

## Nota importante

El formulario solo funcionará cuando el sitio esté alojado en un servidor web (no funcionará localmente con el protocolo `file://`). Asegúrate de subir tus archivos a un servidor web o usar un entorno local como Live Server en VS Code para pruebas.