// ===================================
// PARTICLE ANIMATION SYSTEM
// ===================================

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.connectionDistance = 100;
        this.particleCount = 0;

        // Set canvas size
        this.resizeCanvas();

        // Determine particle count based on screen size
        const screenWidth = window.innerWidth;
        if (screenWidth < 480) {
            this.particleCount = 20; // Very small screens
        } else if (screenWidth < 768) {
            this.particleCount = 30; // Small mobile
        } else if (screenWidth < 1024) {
            this.particleCount = 45; // Tablets
        } else {
            this.particleCount = 60; // Desktop
        }

        // Initialize particles
        this.initParticles();

        // Event listeners
        window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

        // Start animation
        this.animate();
    }

    resizeCanvas() {
        const heroSection = this.canvas.parentElement;
        if (heroSection) {
            this.canvas.width = heroSection.offsetWidth;
            this.canvas.height = heroSection.offsetHeight;
        }
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.5, // Small particles (0.5 - 2px)
                vx: (Math.random() - 0.5) * 0.3, // Very slow movement
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.3 + 0.1, // Very low opacity (10-40%)
                baseOpacity: Math.random() * 0.3 + 0.1
            });
        }
    }

    drawParticles() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connection lines
        this.drawConnections();

        // Draw particles
        for (let particle of this.particles) {
            this.ctx.fillStyle = `rgba(150, 150, 150, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.15; // Very faint lines
                    this.ctx.strokeStyle = `rgba(180, 180, 180, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticles() {
        for (let particle of this.particles) {
            // Move particles
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx = -particle.vx;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy = -particle.vy;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }

            // Subtle opacity fluctuation for organic feel
            particle.opacity = particle.baseOpacity + Math.sin(Date.now() * 0.0005 + Math.random()) * 0.1;
        }
    }

    animate = () => {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize particle system when DOM is ready
let particleSystem = null;
document.addEventListener('DOMContentLoaded', () => {
    particleSystem = new ParticleSystem('particleCanvas');
});

// Reinitialize on window focus for better performance
window.addEventListener('focus', () => {
    if (!particleSystem || !particleSystem.animationId) {
        particleSystem = new ParticleSystem('particleCanvas');
    }
});

window.addEventListener('blur', () => {
    if (particleSystem) {
        particleSystem.destroy();
    }
});

// ===================================
// SMOOTH SCROLLING & NAVIGATION
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// MOBILE STICKY HEADER ON SCROLL
// ===================================

const mobileHeader = document.querySelector('.mobile-sticky-header');
const heroSection = document.querySelector('.hero');
let scrollListener = null;

function initializeMobileHeader() {
    // Check if device is mobile/tablet
    const isMobile = window.innerWidth <= 1024;

    if (mobileHeader && heroSection && isMobile) {
        // Remove old listener if exists
        if (scrollListener) {
            window.removeEventListener('scroll', scrollListener);
        }

        // Create new scroll listener
        scrollListener = () => {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            const scrollPos = window.scrollY;

            if (scrollPos > heroBottom * 0.4) {
                mobileHeader.classList.add('active');
            } else {
                mobileHeader.classList.remove('active');
            }
        };

        window.addEventListener('scroll', scrollListener, { passive: true });
    } else if (scrollListener) {
        // Remove listener if not mobile
        window.removeEventListener('scroll', scrollListener);
        mobileHeader?.classList.remove('active');
    }
}

// Initialize on load
initializeMobileHeader();

// Re-initialize on window resize
window.addEventListener('resize', initializeMobileHeader, { passive: true });

// ===================================
// MOBILE NAVIGATION DROPDOWN MENU
// ===================================

const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.nav-menu-mobile .nav-link');

// Toggle mobile menu
if (mobileNavToggle && mobileMenu) {
    mobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('active');
        
        // Rotate hamburger icon
        const icon = mobileNavToggle.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close menu when a link is clicked
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        if (!mobileMenu.contains(e.target) && !mobileNavToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
            const icon = mobileNavToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// ===================================
// CONTACT FORM HANDLING
// ===================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name') || this.querySelector('input[placeholder="Your Name"]').value;
        const email = formData.get('email') || this.querySelector('input[placeholder="Your Email"]').value;
        const subject = formData.get('subject') || this.querySelector('input[placeholder="Subject"]').value;
        const message = formData.get('message') || this.querySelector('textarea').value;

        // Basic validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Prepare mailto link
        const mailtoLink = `mailto:jasmindababa.23@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;

        // Reset form
        this.reset();

        // Open email client
        window.location.href = mailtoLink;
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe skill cards
document.querySelectorAll('.skill-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Observe education cards
document.querySelectorAll('.education-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Observe tool items
document.querySelectorAll('.tool-item').forEach(item => {
    item.style.opacity = '0';
    observer.observe(item);
});

// Observe highlights
document.querySelectorAll('.highlight').forEach(highlight => {
    highlight.style.opacity = '0';
    observer.observe(highlight);
});

// ===================================
// ACTIVE NAV LINK HIGHLIGHTING
// ===================================

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ===================================
// DOWNLOAD CV FUNCTIONALITY
// ===================================

const cvButton = document.querySelector('.btn-secondary');
if (cvButton) {
    cvButton.addEventListener('click', function(e) {
        // Allow the default download behavior
        // The href attribute already points to the CV file
    });
}

// ===================================
// PAGE LOAD ANIMATION
// ===================================

window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeIn 0.8s ease-in';
    }
});
