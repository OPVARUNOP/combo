// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : 
        '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Sticky Navigation
const navbar = document.querySelector('.navbar');
const heroSection = document.querySelector('.hero');
const heroHeight = heroSection.offsetHeight;

window.addEventListener('scroll', () => {
    if (window.scrollY > heroHeight / 2) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Back to top button
document.querySelector('.back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const isActive = question.classList.contains('active');
        
        // Close all other questions
        faqQuestions.forEach(q => {
            q.classList.remove('active');
            const answer = q.nextElementSibling;
            answer.style.maxHeight = null;
        });
        
        // Toggle current question if it wasn't active
        if (!isActive) {
            question.classList.add('active');
            const answer = question.nextElementSibling;
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Screenshot Carousel
const carouselTrack = document.querySelector('.carousel-track');
const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const dotsContainer = document.querySelector('.carousel-dots');

let currentSlide = 0;
const slideWidth = slides[0].getBoundingClientRect().width;

// Set up the slides
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};

slides.forEach(setSlidePosition);

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

const updateDots = () => {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });};

const goToSlide = (slideIndex) => {
    carouselTrack.style.transform = `translateX(-${slideWidth * slideIndex}px)`;
    currentSlide = slideIndex;
    updateDots();
};

const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
        goToSlide(0);
    } else {
        goToSlide(currentSlide + 1);
    }
};

const prevSlide = () => {
    if (currentSlide === 0) {
        goToSlide(slides.length - 1);
    } else {
        goToSlide(currentSlide - 1);
    }
};

// Event Listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto-advance slides
let slideInterval = setInterval(nextSlide, 5000);

// Pause on hover
const carousel = document.querySelector('.screenshot-carousel');
carousel.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

carousel.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
});

// Initialize first slide
goToSlide(0);
