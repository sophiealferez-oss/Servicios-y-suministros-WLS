/*
 * JavaScript for Servicios y Suministros WLS Landing Page
 * Implements hamburger menu, smooth scrolling, form validation, and machine details
 */

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

// Handle form submission
function handleFormSubmit(event) {
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
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        return;
    }
    
    // If validation passes, show success message
    alert('¡Gracias por tu mensaje! Pronto nos pondremos en contacto contigo.');
    
    // Reset form
    contactForm.reset();
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
    // if (contactForm) {
//     contactForm.addEventListener('submit', handleFormSubmit);
// }

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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);