// Mobile Navigation
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Toggle Nav
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        
        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // Burger Animation
        burger.classList.toggle('toggle');
    });
}

// Scroll Navigation Effect
const scrollNav = () => {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });
}

// Smooth Scrolling for Anchor Links
const smoothScroll = () => {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            const nav = document.querySelector('.nav-links');
            const burger = document.querySelector('.burger');
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetPosition = document.querySelector(targetId).offsetTop - 80;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// Form Submission Handling
const formHandler = () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form elements
            const formElements = Array.from(form.elements);
            const formData = {};
            
            // Collect form data
            formElements.forEach(element => {
                if (element.name && element.value) {
                    formData[element.name] = element.value;
                }
            });
            
            // Here you would typically send the form data to a server
            // For now, we'll just simulate a successful submission
            console.log('Form submitted with data:', formData);
            
            // Show success message
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sent Successfully!';
            submitBtn.style.backgroundColor = '#4CAF50';
            
            // Reset form
            form.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        });
    });
}

// Image Gallery Preview
const galleryPreview = () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // In a full implementation, this would open a lightbox
            // For now, we'll just log that the image was clicked
            console.log('Gallery image clicked:', item);
        });
    });
}

// Instagram Stories Simulation
const instagramStories = () => {
    const storyItems = document.querySelectorAll('.story-item');
    
    storyItems.forEach(story => {
        story.addEventListener('click', () => {
            // In a full implementation, this would open a stories view
            // For now, we'll just log that the story was clicked
            console.log('Story clicked:', story);
            
            // Add a visual feedback
            const circle = story.querySelector('.story-circle');
            circle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                circle.style.transform = '';
            }, 200);
        });
    });
}

// Scroll Animation for Elements
const scrollAnimation = () => {
    const sections = document.querySelectorAll('section');
    const windowHeight = window.innerHeight;
    
    window.addEventListener('scroll', () => {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionBottom = section.getBoundingClientRect().bottom;
            
            // Check if section is in viewport
            if (sectionTop < windowHeight * 0.75 && sectionBottom > 0) {
                section.classList.add('appear');
            }
        });
    });
}

// Initialize All Functions
const app = () => {
    navSlide();
    scrollNav();
    smoothScroll();
    formHandler();
    galleryPreview();
    instagramStories();
    scrollAnimation();
}

// Run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', app); 