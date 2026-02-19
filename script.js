/*
 * JavaScript for Servicios y Suministros WLS Landing Page
 * Implements hamburger menu, smooth scrolling, form validation, and machine details
 */

// API Base URL - Works both locally and on Vercel
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Auth state
let currentUser = null;

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

// Auth Modal Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const closeAuthModal = document.querySelectorAll('.close-auth-modal');
const authButtonsContainer = document.getElementById('authButtons');
const mobileAuthButtonsContainer = document.getElementById('mobileAuthButtons');

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

        // Step 1: Save contact to database (for all users)
        try {
            await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    machine,
                    message
                })
            });
            console.log('Contact saved to database');
        } catch (dbError) {
            console.error('Error saving contact to DB:', dbError);
            // Continue with email sending even if DB save fails
        }

        // Step 2: Send email via EmailJS
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

// ==================== AUTHENTICATION FUNCTIONS ====================

// Check if user is logged in on page load
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        currentUser = JSON.parse(user);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

// Update UI based on auth status
function updateAuthUI(isLoggedIn) {
    // Update sidebar auth buttons (desktop)
    if (authButtonsContainer) {
        if (isLoggedIn && currentUser) {
            authButtonsContainer.innerHTML = `
                <div class="user-info">
                    <span class="user-name">👤 ${currentUser.username}</span>
                    <button class="btn btn-logout" id="logoutBtn">Cerrar Sesión</button>
                </div>
            `;

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            authButtonsContainer.innerHTML = `
                <button class="btn btn-auth" id="loginBtnNav">Iniciar Sesión</button>
                <button class="btn btn-auth btn-register" id="registerBtnNav">Registrarse</button>
            `;

            const loginBtnNav = document.getElementById('loginBtnNav');
            const registerBtnNav = document.getElementById('registerBtnNav');

            if (loginBtnNav) {
                loginBtnNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    openLoginModal();
                });
            }

            if (registerBtnNav) {
                registerBtnNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    openRegisterModal();
                });
            }
        }
    }

    // Update mobile auth buttons (top-right corner)
    if (mobileAuthButtonsContainer) {
        if (isLoggedIn && currentUser) {
            mobileAuthButtonsContainer.innerHTML = `
                <div class="user-info">
                    <span class="user-name">👤 ${currentUser.username}</span>
                    <button class="btn btn-logout" id="logoutBtnMobile">Cerrar Sesión</button>
                </div>
            `;

            const logoutBtnMobile = document.getElementById('logoutBtnMobile');
            if (logoutBtnMobile) {
                logoutBtnMobile.addEventListener('click', handleLogout);
            }
        } else {
            mobileAuthButtonsContainer.innerHTML = `
                <button class="btn btn-auth" id="loginBtnMobile">Iniciar Sesión</button>
                <button class="btn btn-auth btn-register" id="registerBtnMobile">Registrarse</button>
            `;

            const loginBtnMobile = document.getElementById('loginBtnMobile');
            const registerBtnMobile = document.getElementById('registerBtnMobile');

            if (loginBtnMobile) {
                loginBtnMobile.addEventListener('click', (e) => {
                    e.preventDefault();
                    openLoginModal();
                });
            }

            if (registerBtnMobile) {
                registerBtnMobile.addEventListener('click', (e) => {
                    e.preventDefault();
                    openRegisterModal();
                });
            }
        }
    }
}

// Login function
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Ingresando...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;

            alert('¡Bienvenido! Has iniciado sesión correctamente.');
            closeLoginModal();
            loginForm.reset();
            updateAuthUI(true);
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Register function
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (username.length < 3) {
        alert('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Registrando...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;

            alert('¡Cuenta creada exitosamente! Bienvenido.');
            closeRegisterModal();
            registerForm.reset();
            updateAuthUI(true);
        } else {
            alert(data.message || 'Error al crear la cuenta');
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Logout function
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthUI(false);
    alert('Has cerrado sesión correctamente.');
}

// Modal functions
function openLoginModal() {
    if (loginModal) {
        loginModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function openRegisterModal() {
    if (registerModal) {
        registerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    if (registerModal) {
        registerModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
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
let isTabletOrDesktop = false;

// Check if current view is tablet or desktop
function checkViewMode() {
    isTabletOrDesktop = window.innerWidth > 768;
    return isTabletOrDesktop;
}

// Get max slide index based on screen size
function getMaxSlideIndex() {
    if (!carouselSlides || carouselSlides.length === 0) return 0;
    return carouselSlides.length - 1;
}

// Update carousel position
function updateCarousel() {
    if (!carouselTrack || carouselSlides.length === 0) return;

    const maxPosition = getMaxSlideIndex();

    // Ensure currentSlide is within bounds
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide > maxPosition) currentSlide = maxPosition;

    if (window.innerWidth <= 768) {
        // Mobile: use native scroll
        const slideWidth = carouselSlides[currentSlide].offsetWidth + 20;
        carouselTrack.scrollTo({
            left: currentSlide * slideWidth,
            behavior: 'auto'
        });
        updateIndicators();
        updateButtonVisibility();
    } else {
        // Tablet and Desktop: update button visibility based on scroll
        updateButtonVisibility();
    }
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
    }

    // Activate the indicator for the current slide
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add('active');
    }
}

// Update button visibility for tablet/desktop
function updateButtonVisibility() {
    if (!prevBtn || !nextBtn) return;

    if (window.innerWidth <= 768) {
        // Mobile: always show buttons
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        // Tablet and Desktop: show buttons based on scroll position
        const scrollLeft = carouselTrack.scrollLeft;
        const scrollWidth = carouselTrack.scrollWidth;
        const clientWidth = carouselTrack.clientWidth;

        // Show prev button if not at the beginning
        if (scrollLeft > 0) {
            prevBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
        }

        // Show next button if there's more content to scroll
        if (scrollLeft < scrollWidth - clientWidth - 10) {
            nextBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'none';
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
        // Tablet and Desktop: scroll to slide
        currentSlide = slideIndex;
        const slideWidth = carouselSlides[0].offsetWidth + 20;
        carouselTrack.scrollTo({
            left: slideIndex * slideWidth,
            behavior: 'smooth'
        });
        updateButtonVisibility();
    }
}

// Next slide
function nextSlide() {
    if (!carouselSlides || carouselSlides.length === 0) return;

    if (window.innerWidth <= 768) {
        // Mobile: use native scroll to next slide
        const currentScroll = carouselTrack.scrollLeft;
        const slideWidth = carouselSlides[0].offsetWidth + 20;
        const nextScroll = currentScroll + slideWidth;
        const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;

        if (nextScroll <= maxScroll) {
            carouselTrack.scrollTo({
                left: nextScroll,
                behavior: 'auto'
            });
        } else {
            // Loop back to start
            carouselTrack.scrollTo({
                left: 0,
                behavior: 'auto'
            });
        }
    } else {
        // Tablet and Desktop: scroll to next set of visible machines
        const currentScroll = carouselTrack.scrollLeft;
        const slideWidth = carouselSlides[0].offsetWidth + 20;
        const visibleSlides = Math.floor(carouselTrack.clientWidth / slideWidth);
        const nextScroll = currentScroll + (visibleSlides * slideWidth);
        const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;

        if (nextScroll <= maxScroll) {
            carouselTrack.scrollTo({
                left: nextScroll,
                behavior: 'smooth'
            });
        } else {
            // Scroll to end
            carouselTrack.scrollTo({
                left: maxScroll,
                behavior: 'smooth'
            });
        }
    }
}

// Previous slide
function prevSlide() {
    if (!carouselSlides || carouselSlides.length === 0) return;

    if (window.innerWidth <= 768) {
        // Mobile: use native scroll to previous slide
        const currentScroll = carouselTrack.scrollLeft;
        const slideWidth = carouselSlides[0].offsetWidth + 20;
        const prevScroll = currentScroll - slideWidth;

        if (prevScroll >= 0) {
            carouselTrack.scrollTo({
                left: prevScroll,
                behavior: 'auto'
            });
        } else {
            // Loop to end
            const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            carouselTrack.scrollTo({
                left: maxScroll,
                behavior: 'auto'
            });
        }
    } else {
        // Tablet and Desktop: scroll to previous set of visible machines
        const currentScroll = carouselTrack.scrollLeft;
        const slideWidth = carouselSlides[0].offsetWidth + 20;
        const visibleSlides = Math.floor(carouselTrack.clientWidth / slideWidth);
        const prevScroll = currentScroll - (visibleSlides * slideWidth);

        if (prevScroll >= 0) {
            carouselTrack.scrollTo({
                left: prevScroll,
                behavior: 'smooth'
            });
        } else {
            // Scroll to start
            carouselTrack.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    }
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

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeMachineModal() {
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

    // Reset carousel to start from beginning on load
    if (carouselTrack) {
        carouselTrack.scrollLeft = 0;
        currentSlide = 0;
    }

    // Handle resize events
    window.addEventListener('resize', function() {
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
        }

        const indicatorContainer = document.querySelector('.carousel-indicators');
        if (indicatorContainer) {
            indicatorContainer.style.display = 'flex';
        }

        checkViewMode();
        updateCarousel();
        
        // Update button visibility after resize
        setTimeout(() => {
            updateButtonVisibility();
        }, 100);
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
        const galleryTouchThreshold = 200; // ms
        const galleryMoveThreshold = 10; // pixels

        allGalleryItems.forEach(item => {
            // Desktop click
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const machineName = item.getAttribute('data-machine') || item.querySelector('h3').textContent;
                showMachineDetails(machineName);
            });

            // Mobile/Tablet touch handling
            let touchStartX = 0;
            let touchStartY = 0;
            let hasMoved = false;
            let galleryTouchStartTime = 0;

            item.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
                touchStartY = e.changedTouches[0].clientY;
                galleryTouchStartTime = Date.now();
                hasMoved = false;
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const diffX = Math.abs(touchEndX - touchStartX);
                const diffY = Math.abs(touchEndY - touchStartY);

                if (diffX > galleryMoveThreshold || diffY > galleryMoveThreshold) {
                    hasMoved = true;
                }
            }, { passive: true });

            item.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - galleryTouchStartTime;

                // Only trigger click if it was a short tap without significant movement
                if (!hasMoved && touchDuration < galleryTouchThreshold) {
                    const machineName = item.getAttribute('data-machine') || item.querySelector('h3').textContent;
                    showMachineDetails(machineName);
                }
            }, { passive: true });
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

    // Auth form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Show/hide auth modals
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeLoginModal();
            openRegisterModal();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeRegisterModal();
            openLoginModal();
        });
    }

    // Close auth modals
    closeAuthModal.forEach(btn => {
        btn.addEventListener('click', () => {
            closeLoginModal();
            closeRegisterModal();
        });
    });

    // Close auth modals when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                closeRegisterModal();
            }
        });
    }

    // Check auth status on page load
    checkAuthStatus();

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
            e.stopPropagation();
            prevSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
    }

    // Carousel indicators
    const allIndicators = document.querySelectorAll('.indicator');
    if (allIndicators) {
        allIndicators.forEach((indicator) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const slideIndex = parseInt(indicator.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
    }

    // Carousel events
    if (carouselTrack) {
        // Prevent image drag
        const images = carouselTrack.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        });

        // Scroll event for indicators update
        carouselTrack.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                updateIndicators();
            } else {
                updateButtonVisibility();
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
        modal.classList.remove('show');
    }

    initApp();

    // Ensure carousel starts from the beginning
    setTimeout(() => {
        const carouselTrack = document.querySelector('.carousel-track');
        if (carouselTrack) {
            carouselTrack.scrollLeft = 0;
            carouselTrack.style.transform = 'none';
        }
    }, 50);

    setTimeout(() => {
        updateCarousel();
        updateButtonVisibility();
    }, 100);
});
