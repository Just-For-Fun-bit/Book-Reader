// Add these lines at the beginning of your script
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

// DOM Elements
const searchBar = document.querySelector('.search-bar');
const suggestionsContainer = document.getElementById('suggestions-container');
const scrollToTopButton = document.getElementById('scroll-to-top');
const searchButton = document.querySelector('.search-btn');

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to get the closest heading or meaningful content
function getClosestHeading(element) {
    while (element && element !== document.body) {
        if (element.tagName.match(/^H[1-6]$/)) {
            return { text: element.textContent.trim(), element: element };
        }
        if (element.classList.contains('book-card') || element.classList.contains('category-card')) {
            return { text: element.querySelector('h3').textContent.trim(), element: element };
        }
        element = element.parentElement;
    }
    return null;
}

// Function to show suggestions
function showSuggestions(input) {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';

    if (input.length > 0) {
        const suggestions = [
            { text: 'Home', link: '#home' },
            { text: 'Categories', link: '#categories' },
            { text: 'Featured Books', link: '#featured-books' },
            { text: 'Reviews', link: '#reviews' },
            { text: 'Authors', link: '#authors' },
            { text: 'Newsletter', link: '#newsletter' }
        ];

        const matchedSuggestions = suggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(input.toLowerCase())
        );

        if (matchedSuggestions.length > 0) {
            matchedSuggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = suggestion.text;
                div.classList.add('suggestion-item');
                div.addEventListener('click', () => {
                    window.location.href = suggestion.link;
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        }
    }
}

// Debounced version of showSuggestions
const debouncedShowSuggestions = debounce(showSuggestions, 300);

// Clear the search bar
function clearSearchBar() {
    searchBar.value = '';
    suggestionsContainer.innerHTML = '';
}

// Event Listeners
searchBar.addEventListener('input', (e) => debouncedShowSuggestions(e.target.value));

suggestionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-item')) {
        const element = document.querySelector(e.target.dataset.element);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            suggestionsContainer.innerHTML = '';
        }
    }
});

window.addEventListener('scroll', debounce(() => {
    if (window.pageYOffset > 300) {
        scrollToTopButton.classList.add('show');
    } else {
        scrollToTopButton.classList.remove('show');
    }
}, 100));

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

searchButton.addEventListener('click', () => {
    // Implement search functionality here
    console.log('Search button clicked');
});

// You can add more functionality here as needed

// Add this to your existing event listeners
menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
});

// Close the menu when clicking outside of it
document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !menuButton.contains(e.target)) {
        mobileNav.classList.remove('open');
    }
});

// Close the menu when a link is clicked
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
    });
});

// Add event listener to search bar
document.querySelector('.search-bar').addEventListener('input', function() {
    showSuggestions(this.value);
});

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-bar-container')) {
        document.getElementById('suggestions-container').style.display = 'none';
    }
});
