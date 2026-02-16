/*
 * JavaScript for Servicios y Suministros WLS Landing Page
 * Implements hamburger menu, smooth scrolling, form validation, and machine details
 */

// EmailJS Configuration
(function() {
    emailjs.init("MXUf6SrJdCruo3eHu"); // Tu Public Key real de EmailJS
})();

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const sidebarNav = document.querySelector('.sidebar-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('machineModal');
const closeModal = document.querySelector('.close-modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalFeatures = document.getElementById('modalFeatures');

// Carousel Elements (will be defined in initApp after DOM loads)
let carouselTrack, carouselSlides, prevBtn, nextBtn, indicators, galleryItems;

// Toggle mobile menu
function toggleMobileMenu() {
    sidebarNav.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    sidebarNav.classList.remove('active');
    hamburger.classList.remove('active');
}

// Smooth scrolling for anchor links
function smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80;

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, offsetTop);
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const machine = document.getElementById('machine').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email) {
        alert('Por favor completa los campos obligatorios (nombre y email)');
        return;
    }

    if (name.length < 2) {
        alert('Por favor ingresa un nombre válido (mínimo 2 caracteres)');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        return;
    }

    if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) {
        alert('Por favor ingresa un número de teléfono válido');
        return;
    }

    if (message && message.length < 10) {
        alert('Por favor ingresa un mensaje más detallado (mínimo 10 caracteres)');
        return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    try {
        const templateParams = {
            client_name: String(name || ''),
            client_email: String(email || ''),
            client_phone: String(phone || ''),
            machinery_type: String(machine || ''),
            client_message: String(message || ''),
            to_email: 'serviciosysuministroswls@gmail.com'
        };

        console.log('Sending email with parameters:', templateParams);

        const response = await emailjs.send(
            'service_x3ze2tv',
            'template_wls_contact_new',
            templateParams
        );

        console.log('EmailJS response:', response);

        if (response && (response.status === 200 || response.status === 201)) {
            console.log('Correo enviado exitosamente');
            alert('¡Gracias por tu mensaje! Pronto nos pondremos en contacto contigo.');
            contactForm.reset();
        } else {
            throw new Error(`EmailJS error: Status ${response.status}`);
        }
    } catch (error) {
        console.error('Email sending error:', error);

        if (error.status) {
            console.error('EmailJS Error Details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });

            if (error.status === 400) {
                alert('Error de solicitud: Verifica que todos los campos estén completos y sean válidos.');
            } else if (error.status === 401) {
                alert('Error de autenticación: La clave pública o el servicio no están configurados correctamente.');
            } else if (error.status === 404) {
                alert('Error: El servicio o template no se encontró. Verifica tu Service ID y Template ID.');
            } else if (error.status === 500) {
                alert('Error interno del servidor de EmailJS. Por favor intenta más tarde.');
            } else {
                alert(`Error desconocido (${error.status}): ${error.message}`);
            }
        } else {
            alert(`Error al enviar el correo: ${error.message}`);
        }
    } finally {
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

// Carousel functionality
let currentSlide = 0;
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;

// Get visible slides count based on screen size
function getVisibleSlidesCount() {
    const width = window.innerWidth;
    if (width <= 768) {
        return 1; // Mobile: 1 slide visible at a time
    } else {
        return 2; // Tablet and Desktop: 2 slides visible at a time
    }
}

// Get max slide index (number of positions, not individual slides)
function getMaxSlideIndex() {
    const visibleSlides = getVisibleSlidesCount();
    // For tablet/desktop with 4 slides showing 2 at a time, we have 2 positions
    return Math.ceil(carouselSlides.length / visibleSlides) - 1;
}

// Update carousel position
function updateCarousel() {
    if (!carouselTrack || carouselSlides.length === 0) return;

    const visibleSlides = getVisibleSlidesCount();
    const maxPosition = getMaxSlideIndex();

    // Ensure currentSlide is within bounds
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide > maxPosition) currentSlide = maxPosition;

    if (window.innerWidth <= 768) {
        // Mobile: scroll to show one slide at a time
        const slideWidth = carouselSlides[currentSlide].offsetWidth + 30; // 30px gap
        carouselTrack.scrollTo({
            left: currentSlide * slideWidth,
            behavior: 'smooth'
        });
    } else if (window.innerWidth <= 1024) {
        // Tablet: scroll to show 2 slides at a time (jump by 2)
        const positionIndex = currentSlide * visibleSlides;
        if (carouselSlides[positionIndex]) {
            const slideWidth = carouselSlides[positionIndex].offsetWidth + 30;
            carouselTrack.scrollTo({
                left: positionIndex * slideWidth,
                behavior: 'smooth'
            });
        }
    } else {
        // Desktop: use transform (jump by 2 slides)
        const positionIndex = currentSlide * visibleSlides;
        const slideWidth = carouselSlides[0].offsetWidth + 30;
        const translateXValue = -positionIndex * slideWidth;
        carouselTrack.style.transform = `translateX(${translateXValue}px)`;
    }

    updateIndicators();
}

// Update indicators based on current slide
function updateIndicators() {
    if (!indicators || indicators.length === 0) return;

    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (window.innerWidth <= 768) {
        // Mobile: determine active indicator based on scroll position
        const scrollLeft = carouselTrack.scrollLeft;
        const wrapperWidth = carouselTrack.offsetWidth;

        let mostVisibleIndex = 0;
        let maxVisibility = 0;

        carouselSlides.forEach((slide, index) => {
            const slideLeft = slide.offsetLeft;
            const slideRight = slideLeft + slide.offsetWidth;

            const visibleLeft = Math.max(slideLeft, scrollLeft);
            const visibleRight = Math.min(slideRight, scrollLeft + wrapperWidth);
            const visibleWidth = Math.max(0, visibleRight - visibleLeft);
            const visibilityRatio = visibleWidth / slide.offsetWidth;

            if (visibilityRatio > maxVisibility) {
                maxVisibility = visibilityRatio;
                mostVisibleIndex = index;
            }
        });

        currentSlide = mostVisibleIndex;

        // Activate mobile indicator
        const mobileIndicators = document.querySelectorAll('.indicator-mobile');
        if (mobileIndicators[currentSlide]) {
            mobileIndicators[currentSlide].classList.add('active');
        }
    } else {
        // Tablet/Desktop: activate indicator based on position (0 or 1)
        const desktopIndicators = document.querySelectorAll('.indicator-desktop');
        if (desktopIndicators[currentSlide]) {
            desktopIndicators[currentSlide].classList.add('active');
        }
    }
}

// Go to specific slide
function goToSlide(slideIndex) {
    if (!carouselSlides || slideIndex < 0) return;

    if (window.innerWidth <= 768) {
        // Mobile: can go to any of the 4 slides
        if (slideIndex < carouselSlides.length) {
            currentSlide = slideIndex;
            updateCarousel();
        }
    } else {
        // Tablet/Desktop: only 2 positions (0 and 1)
        const maxPosition = getMaxSlideIndex();
        if (slideIndex <= maxPosition) {
            currentSlide = slideIndex;
            updateCarousel();
        }
    }
}

// Next slide
function nextSlide() {
    if (!carouselSlides || carouselSlides.length === 0) return;

    const maxPosition = getMaxSlideIndex();

    if (currentSlide < maxPosition) {
        currentSlide++;
        updateCarousel();
    } else {
        // Loop back to first position
        currentSlide = 0;
        updateCarousel();
    }
}

// Previous slide
function prevSlide() {
    if (!carouselSlides || carouselSlides.length === 0) return;

    const maxPosition = getMaxSlideIndex();

    if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
    } else {
        // Loop to last position
        currentSlide = maxPosition;
        updateCarousel();
    }
}

// Touch events for mobile and tablet
function handleTouchStart(event) {
    if (window.innerWidth > 1024) return;

    touchStartX = event.changedTouches[0].clientX;
    isDragging = false;
    event.preventDefault();
}

function handleTouchMove(event) {
    if (window.innerWidth > 1024) return;
    if (event.touches.length > 1) return;

    touchEndX = event.touches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 10) {
        isDragging = true;
        event.preventDefault();
    }
}

function handleTouchEnd(event) {
    if (window.innerWidth > 1024) return;

    touchEndX = event.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const minSwipeDistance = 30;

    if (Math.abs(diffX) > minSwipeDistance && isDragging) {
        if (diffX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }

    isDragging = false;
}

// Mouse drag events for desktop
function handleMouseDown(event) {
    if (window.innerWidth <= 1024) return;

    touchStartX = event.clientX;
    isDragging = false;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(event) {
    if (window.innerWidth <= 1024) return;

    touchEndX = event.clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 10) {
        isDragging = true;
    }
}

function handleMouseUp(event) {
    if (window.innerWidth <= 1024) return;

    touchEndX = event.clientX;
    const diffX = touchStartX - touchEndX;
    const minSwipeDistance = 30;

    if (Math.abs(diffX) > minSwipeDistance && isDragging) {
        if (diffX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }

    isDragging = false;

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

// Show machine details modal
function showMachineDetails(machineName) {
    const machine = machineData[machineName];

    if (machine) {
        modalTitle.textContent = machine.title;
        modalFeatures.innerHTML = '';

        machine.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalFeatures.appendChild(li);
        });

        modalImage.src = machine.image;
        modalImage.alt = machine.title;

        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeMachineModal() {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Initialize the application
function initApp() {
    carouselTrack = document.querySelector('.carousel-track');
    carouselSlides = document.querySelectorAll('.carousel-slide');
    prevBtn = document.querySelector('.prev-btn');
    nextBtn = document.querySelector('.next-btn');
    indicators = document.querySelectorAll('.indicator');
    galleryItems = document.querySelectorAll('.gallery-item');

    // Handle resize events
    window.addEventListener('resize', function() {
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
        }

        const indicatorContainer = document.querySelector('.carousel-indicators');
        if (indicatorContainer) {
            indicatorContainer.style.display = 'flex';
        }

        updateCarousel();
    });

    // Hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
            closeMobileMenu();
        });
    });

    // Gallery items click handlers - show machine details
    const allGalleryItems = document.querySelectorAll('.gallery-item');
    if (allGalleryItems) {
        allGalleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const machineName = item.getAttribute('data-machine') || item.querySelector('h3').textContent;
                showMachineDetails(machineName);
            });
        });
    }

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', closeMachineModal);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMachineModal();
            }
        });
    }

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Intersection Observer
    setupIntersectionObserver();

    // Active navigation on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Carousel navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });
    }

    // Carousel indicators
    const allIndicators = document.querySelectorAll('.indicator');
    if (allIndicators) {
        allIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                const slideIndex = parseInt(indicator.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
    }

    // Touch and mouse drag events for carousel
    if (carouselTrack) {
        // Touch events
        carouselTrack.addEventListener('touchstart', handleTouchStart, { passive: false });
        carouselTrack.addEventListener('touchmove', handleTouchMove, { passive: false });
        carouselTrack.addEventListener('touchend', handleTouchEnd);

        // Mouse events
        carouselTrack.addEventListener('mousedown', handleMouseDown);

        // Prevent image drag
        const images = carouselTrack.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        });

        // Scroll event for indicators update
        carouselTrack.addEventListener('scroll', () => {
            // Only update from scroll on mobile
            if (window.innerWidth <= 768) {
                updateIndicators();
            }
        });
    }

    // Initialize carousel position
    currentSlide = 0;
    updateCarousel();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('machineModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }

    initApp();

    setTimeout(() => {
        updateCarousel();
    }, 100);
});
