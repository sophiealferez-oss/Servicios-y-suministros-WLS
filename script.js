// Toggle mobile menu
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission
const rentalForm = document.getElementById('rentalForm');
if(rentalForm) {
    rentalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const equipmentType = this.querySelector('#equipmentType').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if(name && email && equipmentType && message) {
            // In a real application, you would send this data to a server
            alert(`¡Gracias ${name}! Tu solicitud de alquiler para ${equipmentType} ha sido recibida. Te contactaremos pronto.`);
            
            // Reset form
            this.reset();
        } else {
            alert('Por favor completa todos los campos obligatorios.');
        }
    });
}

// Add to cart functionality for rental buttons
const rentButtons = document.querySelectorAll('.rent-btn');
rentButtons.forEach(button => {
    button.addEventListener('click', function() {
        const equipmentName = this.closest('.equipment-item').querySelector('h3').textContent;
        alert(`¡${equipmentName} agregado a tu solicitud de alquiler!`);
    });
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.category-card, .equipment-item, .service-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if(elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Set initial state for animated elements
document.querySelectorAll('.category-card, .equipment-item, .service-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Listen for scroll event to trigger animations
window.addEventListener('scroll', animateOnScroll);

// Initialize animations on load
window.addEventListener('load', animateOnScroll);

// CTA button scroll to equipment section
const ctaBtn = document.querySelector('.cta-btn');
if(ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        const equipmentSection = document.getElementById('maquinaria');
        if(equipmentSection) {
            window.scrollTo({
                top: equipmentSection.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
}