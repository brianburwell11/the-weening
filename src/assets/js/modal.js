// Modal functionality for movie cards
class MovieModal {
    constructor() {
        this.modal = null;
        this.iframe = null;
        this.closeBtn = null;
        this.loading = null;
        this.init();
    }

    init() {
        // Create modal HTML
        this.createModal();

        // Add event listeners
        this.addEventListeners();
    }

    createModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div class="modal-overlay" id="movieModal">
                <div class="modal-content">
                    <button class="modal-close" id="modalClose">&times;</button>
                    <div class="modal-loading" id="modalLoading">Loading...</div>
                    <iframe class="modal-iframe" id="modalIframe" style="display: none;"></iframe>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get references to modal elements
        this.modal = document.getElementById('movieModal');
        this.iframe = document.getElementById('modalIframe');
        this.closeBtn = document.getElementById('modalClose');
        this.loading = document.getElementById('modalLoading');
    }

    addEventListeners() {
        // Close modal when clicking overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal when clicking close button
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Handle movie card clicks
        document.addEventListener('click', (e) => {
            const movieCard = e.target.closest('.movie-card');
            if (movieCard) {
                e.preventDefault();
                const href = movieCard.getAttribute('href');
                if (href) {
                    this.openModal(href);
                }
            }
        });
    }

    openModal(url) {
        // Show loading state
        this.loading.style.display = 'block';
        this.iframe.style.display = 'none';

        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Load content in iframe
        this.iframe.src = url;

        // Hide loading when iframe loads
        this.iframe.onload = () => {
            this.loading.style.display = 'none';
            this.iframe.style.display = 'block';
        };

        // Handle iframe load errors
        this.iframe.onerror = () => {
            this.loading.textContent = 'Error loading content';
        };
    }

    closeModal() {
        // Hide modal
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Clear iframe source after animation
        setTimeout(() => {
            if (!this.modal.classList.contains('active')) {
                this.iframe.src = '';
                this.loading.style.display = 'block';
                this.iframe.style.display = 'none';
                this.loading.textContent = 'Loading...';
            }
        }, 300);
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieModal();
});
