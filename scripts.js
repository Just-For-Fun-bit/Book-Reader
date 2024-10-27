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

// Function to gather book information from the page
function gatherBookInfo() {
    const bookCards = document.querySelectorAll('.book-card');
    return Array.from(bookCards).map(card => {
        const title = card.querySelector('h3').textContent.trim();
        const id = card.id || `book-${title.toLowerCase().replace(/\s+/g, '-')}`;
        return { text: title, link: `#${id}`, type: 'book' };
    });
}

// Function to show suggestions
function showSuggestions(input) {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';

    if (input.length > 0) {
        const sections = [
            { text: 'Home', link: '#home', type: 'section' },
            { text: 'Categories', link: '#categories', type: 'section' },
            { text: 'Featured Books', link: '#featured-books', type: 'section' },
            { text: 'Reviews', link: '#reviews', type: 'section' },
            { text: 'Authors', link: '#authors', type: 'section' },
            { text: 'Newsletter', link: '#newsletter', type: 'section' }
        ];

        const books = gatherBookInfo();
        const allSuggestions = [...sections, ...books];

        const matchedSuggestions = allSuggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(input.toLowerCase())
        );

        if (matchedSuggestions.length > 0) {
            matchedSuggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = suggestion.text;
                div.classList.add('suggestion-item');
                div.classList.add(suggestion.type); // Add class based on type
                div.addEventListener('click', () => {
                    const targetElement = document.querySelector(suggestion.link);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        suggestionsContainer.style.display = 'none';
                        searchBar.value = suggestion.text; // Set search bar value to selected suggestion
                    }
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

// Add this to ensure the book cards have proper IDs
document.addEventListener('DOMContentLoaded', function() {
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        if (!card.id) {
            const title = card.querySelector('h3').textContent.trim();
            card.id = `book-${title.toLowerCase().replace(/\s+/g, '-')}`;
        }
    });
});
