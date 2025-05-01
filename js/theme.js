/**
 * Dark mode functionality for Maria Ruoro's website
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set the theme
    const setTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
            localStorage.setItem('theme', 'dark');
            console.log('Dark mode enabled');
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
            localStorage.setItem('theme', 'light');
            console.log('Light mode enabled');
        }
    };
    
    // Check for saved theme preference or use the system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        setTheme(true);
    } else if (savedTheme === 'light') {
        setTheme(false);
    } else {
        // If no preference is saved, use the system preference
        setTheme(prefersDarkScheme.matches);
    }
    
    // Toggle theme when button is clicked
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            setTheme(!isDarkMode);
        });
    } else {
        console.warn('Theme toggle button not found');
    }
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        // Only update if the user hasn't set a preference
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches);
        }
    });
    
    // Add a small delay to ensure proper theme application
    setTimeout(() => {
        // Reapply theme once to ensure CSS transitions work correctly
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            document.body.classList.remove('dark-mode');
            setTimeout(() => document.body.classList.add('dark-mode'), 50);
        }
    }, 100);
}); 