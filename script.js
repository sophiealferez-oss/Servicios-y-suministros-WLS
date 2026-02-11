/*
 * JavaScript for Servicios y Suministros WLS Landing Page
 * Implements hamburger menu, smooth scrolling, form validation, and machine details
 */

// EmailJS Configuration
// Para que esta funcionalidad funcione, tienes dos opciones:
// OPCIÓN 1 (recomendada para frontend): 
// 1. Obtén tu Public Key de EmailJS (no la API Key) y reemplaza 'YOUR_PUBLIC_KEY'
// 2. Conecta tu proveedor de correo y crea el template 'template_wls_contact'

// OPCIÓN 2 (si solo tienes API Key):
// 1. Usa el método sendForm con tu API Key (ver comentario en handleFormSubmit)

// Si usas la Public Key (método recomendado para frontend):
(function() {
    emailjs.init("MXUf6SrJdCruo3eHu"); // Tu Public Key real de EmailJS
})();

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const sidebarNav = document.querySelector('.sidebar-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const contactForm = document.getElementById('contactForm');
const galleryItems = document.querySelectorAll('.gallery-item');
const modal = document.getElementById('machineModal');
const closeModal = document.querySelector('.close-modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalFeatures = document.getElementById('modalFeatures');

// Toggle mobile menu
function toggleMobileMenu() {
    sidebarNav.classList.toggle('active');
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    sidebarNav.classList.remove('active');
}

// Smooth scrolling for anchor links
function smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 80, // Account for fixed header
            behavior: 'smooth'
        });
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const machine = document.getElementById('machine').value;
    const message = document.getElementById('message').value.trim();

    // Basic validation
    if (!name || !email) {
        alert('Por favor completa los campos obligatorios (nombre y email)');
        return;
    }

    // Additional validation for name (minimum length)
    if (name.length < 2) {
        alert('Por favor ingresa un nombre válido (mínimo 2 caracteres)');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        return;
    }

    // Phone validation (if provided)
    if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) {
        alert('Por favor ingresa un número de teléfono válido');
        return;
    }

    // Message validation (optional but with minimum length if provided)
    if (message && message.length < 10) {
        alert('Por favor ingresa un mensaje más detallado (mínimo 10 caracteres)');
        return;
    }

    // Show loading message
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    try {
        // Prepare template parameters
        const templateParams = {
            from_name: name,
            from_email: email,
            from_phone: phone,
            machine_type: machine,
            message: message,
            to_email: 'serviciosysuministroswls@gmail.com' // Dirección de destino
        };

        // Debug: Log the template parameters to console
        console.log('Sending email with parameters:', templateParams);

        // Send email via EmailJS
        // Si tienes la Public Key (recomendado):
        // IMPORTANTE: Verifica que el Service ID sea correcto en tu dashboard de EmailJS
        console.log('Enviando correo con parámetros:', templateParams); // Debug: Log the parameters
        
        // DEBUG: First, let's get the list of available services to identify the correct one
        // Uncomment the following lines temporarily to see your available services:
        /*
        try {
            const services = await emailjs.init().getServiceID();
            console.log('Available services:', services);
        } catch (e) {
            console.log('Could not retrieve services list:', e);
        }
        */
        
        // Send email via EmailJS
        // IMPORTANT: Make sure the Service ID matches your actual service in EmailJS dashboard
        // To find your correct Service ID:
        // 1. Log into https://dashboard.emailjs.com/
        // 2. Go to "Email Services" section
        // 3. Look for the service you connected (Gmail, Outlook, etc.)
        // 4. Click on it and look for the "Service ID" field (it might not be simply "gmail")
        const response = await emailjs.send(
            'service_x3ze2tv', // Service ID - REPLACE WITH THE ACTUAL SERVICE ID FROM YOUR EMAILJS DASHBOARD
            'template_wls_contact', // Template ID - make sure this template exists in your EmailJS dashboard
            templateParams
        );

        console.log('EmailJS response:', response); // Debug: Log the response
        console.log('Response status:', response.status); // Debug: Log status
        console.log('Response text:', response.text); // Debug: Log response text

        // ALTERNATIVA: Si solo tienes la API Key (requiere backend o proxy):
        // Descomenta este bloque y comenta el bloque anterior si usas API Key directamente
        /*
        const response = await emailjs.sendForm(
            'your_service_id', // Service ID
            'template_wls_contact', // Template ID
            '#contactForm', // Selector del formulario
            'YOUR_API_KEY' // Tu API Key aquí
        );
        */

        // Verificar respuesta exitosa (EmailJS puede devolver diferentes códigos de éxito)
        if (response && (response.status === 200 || response.status === 201)) {
            // Success
            console.log('Correo enviado exitosamente');
            alert('¡Gracias por tu mensaje! Pronto nos pondremos en contacto contigo.');
            contactForm.reset();
        } else {
            // Si el status no es 200 o 201, lanzar un error
            console.error('Error: Código de estado inesperado:', response.status);
            throw new Error(`EmailJS error: Status ${response.status}`);
        }
    } catch (error) {
        // Comprehensive error handling
        console.error('Email sending error:', error);
        
        // Check if it's an EmailJS specific error
        if (error.status) {
            console.error('EmailJS Error Details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            
            // Different alerts based on error type
            if (error.status === 400) {
                alert('Error de solicitud: Verifica que todos los campos estén completos y sean válidos. Revisa la consola para más detalles.');
            } else if (error.status === 401) {
                alert('Error de autenticación: La clave pública o el servicio no están configurados correctamente. Revisa la consola para más detalles.');
            } else if (error.status === 404) {
                alert('Error: El servicio o template no se encontró. Verifica tu Service ID y Template ID en EmailJS. Revisa la consola para más detalles.');
            } else if (error.status === 500) {
                alert('Error interno del servidor de EmailJS. Por favor intenta más tarde. Revisa la consola para más detalles.');
            } else {
                alert(`Error desconocido (${error.status}): ${error.message}. Revisa la consola para más detalles.`);
            }
        } else {
            // General error (might not be an HTTP error)
            console.error('General Error Details:', {
                message: error.message,
                name: error.name
            });
            
            alert(`Error al enviar el correo: ${error.message}. Revisa la consola para más detalles.`);
        }
    } finally {
        // Restore button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Intersection Observer for fade-in animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Machine data
const machineData = {
    'Retroexcavadora': {
        title: 'Retroexcavadora Caterpillar 430',
        features: [
            'Caterpillar 430 (mediana)',
            'Equipo versátil',
            'Excavación y cargue',
            'Potente y confiable',
            'Ideal para proyectos medianos'
        ],
        image: 'imagenes_maquinaria/retroexcavadora.jpg'
    },
    'Excavadora': {
        title: 'Excavadora',
        features: [
            'Alto rendimiento',
            'Ideal para movimiento de tierra',
            'Potente y precisa',
            'Apta para obras cíviles y proyectos de gran escala'
        ],
        image: 'imagenes_maquinaria/excavadora.jpg'
    },
    'Vibrocompactador': {
        title: 'Vibrocompactador',
        features: [
            'Equipos de 6,7,8,10 y 12 toneladas',
            'Excelente compactación de suelos y asfalto',
            'Alta eficiencia y estabilidad',
            'Ideal para vías, rellenos y plataformas'
        ],
        image: 'imagenes_maquinaria/vibrocompactador.jpg'
    },
    'Motoniveladora': {
        title: 'Motoniveladora',
        features: [
            'Precisión en nivelación',
            'Ideal para acabados finos',
            'Eficiente en movimiento de tierras',
            'Perfecta para mantenimiento vial'
        ],
        image: 'imagenes_maquinaria/motoniveladora.jpg'
    }
};

// Show machine details modal
function showMachineDetails(machineName) {
    const machine = machineData[machineName];

    if (machine) {
        modalTitle.textContent = machine.title;

        // Clear previous features
        modalFeatures.innerHTML = '';

        // Add new features
        machine.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalFeatures.appendChild(li);
        });

        modalImage.src = machine.image;
        modalImage.alt = machine.title;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
}

// Close modal
function closeMachineModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Function to debug and find available EmailJS services
async function debugEmailServices() {
    try {
        // Wait a bit to ensure emailjs is initialized
        setTimeout(async () => {
            try {
                // Attempt to get service information
                console.log('EmailJS initialized with public key:', emailjs.getUserID());
                
                // Note: EmailJS doesn't expose a direct method to list services
                // The best way is to check your dashboard at https://dashboard.emailjs.com/
                console.log('To find your correct Service ID:');
                console.log('1. Log into https://dashboard.emailjs.com/');
                console.log('2. Go to "Email Services" section');
                console.log('3. Look for the service you connected (Gmail, Outlook, etc.)');
                console.log('4. Click on it and look for the "Service ID" field');
            } catch (e) {
                console.log('Could not retrieve service info:', e);
            }
        }, 1000);
    } catch (error) {
        console.error('Debug function error:', error);
    }
}

// Initialize the application
function initApp() {
    // Add event listener for hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Add event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
            closeMobileMenu(); // Close menu after clicking
        });
    });

    // Add event listeners for gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const machineName = item.querySelector('h3').textContent;
            showMachineDetails(machineName);
        });
    });

    // Add event listener for closing modal
    closeModal.addEventListener('click', closeMachineModal);

    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeMachineModal();
        }
    });

    // Add event listener for form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Setup intersection observer for animations
    setupIntersectionObserver();

    // Add active class to navigation based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100; // Adjust offset as needed

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Debug EmailJS services (remove this in production)
    debugEmailServices();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);