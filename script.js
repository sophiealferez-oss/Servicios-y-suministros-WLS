/*
 * JavaScript for Servicios y Suministros WLS Landing Page
 * Implements hamburger menu, smooth scrolling, and form validation
 */

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const sidebarNav = document.querySelector('.sidebar-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const contactForm = document.getElementById('contactForm');

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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);