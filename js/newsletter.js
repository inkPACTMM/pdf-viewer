// newsletter.js - Newsletter page functionality
(function () {
    'use strict';

    // Configuration
    const API_BASE = 'https://dashboard.inkpactmm.org';

    // Helper function to resolve absolute URLs
    function toAbsolute(path) {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    // Handle contact form submission
    function handleContactForm(event) {
        event.preventDefault();

        const form = event.target;
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        const subscribeToNewsletter = document.getElementById('subscribeToNewsletter').checked;

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';

        // Simulate API call (replace with actual API endpoint)
        setTimeout(() => {
            // Success
            let message_text = `Thank you ${name}! Your message has been sent successfully.`;
            
            if (subscribeToNewsletter) {
                message_text += '\n\nYou have also been subscribed to our newsletter!';
            }
            
            alert(message_text);
            form.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 1500);

        // For actual implementation:
        /*
        const payload = {
            name,
            email,
            message,
            subscribe: subscribeToNewsletter
        };

        fetch(`${API_BASE}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            let successMessage = `Thank you ${name}! Your message has been sent successfully.`;
            if (subscribeToNewsletter) {
                successMessage += '\n\nYou have also been subscribed to our newsletter!';
            }
            alert(successMessage);
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again later.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
        */
    }

    // Handle subscribe form submission
    function handleSubscribe(event) {
        event.preventDefault();

        const form = event.target;
        const name = document.getElementById('subscribeName').value;
        const email = document.getElementById('subscribeEmail').value;
        const agreed = document.getElementById('agreeTerms').checked;

        if (!agreed) {
            alert('Please agree to receive newsletters and updates.');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Subscribing...';

        // Simulate API call (replace with actual API endpoint)
        setTimeout(() => {
            // Success
            alert(`Thank you ${name}! You've been subscribed to our newsletter at ${email}`);
            form.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 1500);

        // For actual implementation:
        /*
        fetch(`${API_BASE}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`Thank you ${name}! You've been subscribed successfully.`);
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error. Please try again later.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
        */
    }

    // Add navbar scroll effect
    function handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Initialize page
    function init() {
        // Set up contact form handler
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactForm);
        }

        // Set up subscribe form handler
        const subscribeForm = document.getElementById('subscribeForm');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', handleSubscribe);
        }

        // Set up navbar scroll effect
        window.addEventListener('scroll', handleNavbarScroll);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        console.log('Contact & Newsletter page initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
