document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const scrollIndicator = document.getElementById('scrollIndicator');
    const parallaxElements = document.querySelectorAll('.parallax-element');
    const panels = document.querySelectorAll('.comic-panel');
    let isScrolling = false;
    let scrollTimer = null;

    // Add panel numbers to images for placeholder text
    const comicImages = document.querySelectorAll('.comic-image');
    comicImages.forEach((img, index) => {
        img.setAttribute('data-panel', index + 1);
        
        // Handle image load errors - show placeholder
        img.addEventListener('error', function() {
            this.style.background = getPlaceholderGradient(index);
            this.style.minWidth = '300px';
            this.style.minHeight = '200px';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.innerHTML = `<span style="color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Panel ${index + 1}<br/>Placeholder</span>`;
        });
    });

    // Placeholder gradient colors
    function getPlaceholderGradient(index) {
        const gradients = [
            'linear-gradient(45deg, #ff6b6b, #feca57)',
            'linear-gradient(45deg, #48dbfb, #0abde3)',
            'linear-gradient(45deg, #1dd1a1, #10ac84)',
            'linear-gradient(45deg, #ff9ff3, #f368e0)',
            'linear-gradient(45deg, #feca57, #ff9ff3)'
        ];
        return gradients[index] || gradients[0];
    }

    // Intersection Observer for parallax and fade effects
    const observerOptions = {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-10% 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const image = entry.target.querySelector('.comic-image');
            if (!image) return;

            if (entry.isIntersecting) {
                // Element is visible
                image.classList.add('visible');
                
                // Add parallax effect based on intersection ratio
                if (entry.intersectionRatio > 0.5) {
                    image.classList.add('parallax-active');
                } else {
                    image.classList.remove('parallax-active');
                }
            } else {
                // Element is not visible
                image.classList.remove('visible', 'parallax-active');
            }
        });
    }, observerOptions);

    // Observe all panels except the first one (it has fade-in)
    panels.forEach((panel, index) => {
        if (index > 0) { // Skip first panel
            observer.observe(panel);
        }
    });



    // Function to handle scroll indicator fade in/out
    function handleScrollIndicator() {
        // Hide indicator when scrolling
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '0';
        }
        
        // Clear existing timer
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        
        // Show indicator after scrolling stops (2 seconds)
        scrollTimer = setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '1';
            }
        }, 2000);
    }

    // Scroll event handler for additional effects
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                // Handle scroll indicator fade
                handleScrollIndicator();

                // Parallax effect for visible elements
                parallaxElements.forEach((element) => {
                    const rect = element.getBoundingClientRect();
                    const elementTop = rect.top;
                    const elementHeight = rect.height;
                    
                    // Check if element is in viewport
                    if (elementTop < windowHeight && elementTop + elementHeight > 0) {
                        // Calculate parallax offset
                        const parallaxSpeed = 0.5;
                        const yPos = -(elementTop * parallaxSpeed);
                        element.style.transform = `translateY(${yPos}px) scale(${element.classList.contains('visible') ? 1 : 0.9})`;
                    }
                });

                ticking = false;
            });
            ticking = true;
        }
    }

    // Throttled scroll event
    window.addEventListener('scroll', handleScroll, { passive: true });
    


    // Touch events for mobile optimization
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - scroll down
                smoothScrollToNext();
            } else {
                // Swipe down - scroll up
                smoothScrollToPrev();
            }
        }
    }

    function smoothScrollToNext() {
        const currentScroll = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const nextPosition = Math.ceil(currentScroll / windowHeight) * windowHeight;
        
        window.scrollTo({
            top: nextPosition,
            behavior: 'auto'
        });
    }

    function smoothScrollToPrev() {
        const currentScroll = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const prevPosition = Math.floor(currentScroll / windowHeight) * windowHeight;
        
        window.scrollTo({
            top: prevPosition,
            behavior: 'auto'
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                smoothScrollToNext();
                break;
            case 'ArrowUp':
                e.preventDefault();
                smoothScrollToPrev();
                break;
        }
    });

    // Resize handler for mobile orientation changes
    window.addEventListener('resize', function() {
        // Recalculate positions after orientation change
        setTimeout(() => {
            handleScroll();
        }, 100);
    });

    // Performance optimization: Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 && 
                          navigator.deviceMemory <= 4;

    if (isLowEndDevice) {
        document.body.classList.add('low-end-device');
        // Disable some animations for better performance
        document.querySelectorAll('.parallax-element').forEach(el => {
            el.style.transition = 'opacity 0.3s ease';
        });
    }

    // Help button navigation
    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
        helpButton.addEventListener('click', function() {
            window.location.href = 'help.html';
        });
    }

    // Initial trigger for first panel
    setTimeout(() => {
        const firstImage = document.getElementById('image1');
        if (firstImage) {
            firstImage.classList.add('visible');
        }
        
        // Initialize scroll indicator with full opacity
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '1';
        }
    }, 500);
});