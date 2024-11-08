class ThoughtsManager {
    constructor() {
        this.thoughts = [
            {
                id: 1,
                content: "Sometimes I wonder if anyone else feels the same way I do. It's comforting to know there's a place where I can share these thoughts without judgment.",
                date: "November 8, 2024",
                tags: ['reflection', 'personal-growth']
            },
            {
                id: 2,
                content: "Today was challenging, but writing this helps me process my emotions. Thank you for providing this space.",
                date: "November 8, 2024",
                tags: ['personal-growth']
            },
            {
                id: 3,
                content: "I've been thinking about how much we all grow and change over time. Sometimes it's hard to see the progress when you're in the middle of it.",
                date: "November 8, 2024",
                tags: ['reflection', 'personal-growth']
            }
        ];
        
        this.activeFilters = {
            tag: null,
            search: ''
        };
        
        this.init();
        
        // Check hash for shared thought on load
        this.checkHashForSharedThought();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.checkHashForSharedThought();
        });
    }

    init() {
        this.grid = document.getElementById('thoughtsGrid');
        this.modal = document.getElementById('thoughtModal');
        
        if (!this.grid || !this.modal) {
            console.error('Required elements not found');
            return;
        }

        this.setupControls();
        this.setupModal();
        this.renderThoughts();
    }

    setupControls() {
        this.setupSearchAndSort();
        this.setupTagFiltering();
    }

    setupSearchAndSort() {
        const controlsContainer = document.querySelector('.controls-container');
        const searchSortContainer = document.createElement('div');
        searchSortContainer.className = 'search-sort-container';

        // Create sort select
        const sortSelect = document.createElement('select');
        sortSelect.className = 'sort-select';
        sortSelect.innerHTML = `
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="longest">Longest First</option>
            <option value="shortest">Shortest First</option>
        `;
        sortSelect.addEventListener('change', (e) => this.sortThoughts(e.target.value));

        // Create search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search thoughts...';
        searchInput.addEventListener('input', (e) => {
            this.activeFilters.search = e.target.value;
            this.applyFilters();
        });

        searchSortContainer.appendChild(searchInput);
        searchSortContainer.appendChild(sortSelect);
        controlsContainer.appendChild(searchSortContainer);
    }

    setupTagFiltering() {
        const tags = [...new Set(this.thoughts.flatMap(t => t.tags))];
        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-container';
        
        tags.forEach(tag => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-button';
            tagBtn.textContent = tag.replace('-', ' ');
            tagBtn.addEventListener('click', (e) => {
                if (this.activeFilters.tag === tag) {
                    // Untoggle if clicking active tag
                    this.activeFilters.tag = null;
                    tagBtn.classList.remove('active');
                } else {
                    // Set new active tag
                    this.activeFilters.tag = tag;
                    document.querySelectorAll('.tag-button').forEach(btn => 
                        btn.classList.remove('active')
                    );
                    tagBtn.classList.add('active');
                }
                this.applyFilters();
            });
            tagContainer.appendChild(tagBtn);
        });
        
        document.querySelector('.controls-container').appendChild(tagContainer);
    }

    applyFilters() {
        let filteredThoughts = [...this.thoughts];

        // Apply tag filter
        if (this.activeFilters.tag) {
            filteredThoughts = filteredThoughts.filter(thought => 
                thought.tags.includes(this.activeFilters.tag)
            );
        }

        // Apply search filter
        if (this.activeFilters.search) {
            const searchTerm = this.activeFilters.search.toLowerCase();
            filteredThoughts = filteredThoughts.filter(thought =>
                thought.content.toLowerCase().includes(searchTerm)
            );
        }

        this.renderThoughts(filteredThoughts);
    }

    sortThoughts(method) {
        let thoughts = [...this.thoughts];
        switch(method) {
            case 'newest':
                thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                thoughts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'longest':
                thoughts.sort((a, b) => b.content.length - a.content.length);
                break;
            case 'shortest':
                thoughts.sort((a, b) => a.content.length - b.content.length);
                break;
        }
        this.thoughts = thoughts;
        this.applyFilters();
    }

    renderThoughts(thoughts = this.thoughts) {
        this.grid.innerHTML = '';
        
        if (thoughts.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <h3>No thoughts found</h3>
                <p>Try adjusting your search or filters</p>
            `;
            this.grid.appendChild(emptyState);
            return;
        }
        
        thoughts.forEach(thought => {
            const card = this.createThoughtCard(thought);
            this.grid.appendChild(card);
        });
    }

    createThoughtCard(thought) {
        const card = document.createElement('div');
        card.className = 'thought-card';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', 'Thought card');
        card.innerHTML = `
            <div class="thought-content">${thought.content}</div>
            <div class="card-footer">
                <span class="read-more">Read more</span>
                <div class="thought-date">Shared on ${thought.date}</div>
            </div>
        `;

        card.querySelector('.read-more').addEventListener('click', () => {
            this.openModal(thought);
        });

        return card;
    }

    setupModal() {
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.modal.style.display = 'none';
                // Clear hash when closing modal
                window.location.hash = '';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
                window.location.hash = '';
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.modal.style.display = 'none';
                window.location.hash = '';
            }
        });
    }

    openModal(thought) {
        const modalContent = document.getElementById('modalContent');
        const modalDate = document.getElementById('modalDate');
        
        modalContent.textContent = thought.content;
        modalDate.textContent = `Shared on ${thought.date}`;
        
        // Create unique URL for this thought
        const thoughtUrl = this.createThoughtUrl(thought);
        
        // Add share options
        const shareOptions = document.createElement('div');
        shareOptions.className = 'share-options';
        shareOptions.innerHTML = `
            <div class="share-title">Share this thought</div>
            <div class="share-buttons">
                <button class="share-button copy">
                    <i class="fas fa-link"></i>
                    Copy Link
                </button>
                <button class="share-button email">
                    <i class="fas fa-envelope"></i>
                    Email
                </button>
            </div>
        `;

        // Add event listeners for share buttons
        const copyBtn = shareOptions.querySelector('.copy');
        copyBtn.addEventListener('click', () => this.copyToClipboard(thoughtUrl, thought));

        const emailBtn = shareOptions.querySelector('.email');
        emailBtn.addEventListener('click', () => this.shareViaEmail(thought, thoughtUrl));

        // Clear previous share options and add new ones
        const existingShareOptions = document.querySelector('.share-options');
        if (existingShareOptions) {
            existingShareOptions.remove();
        }
        document.querySelector('.modal-content').appendChild(shareOptions);
        
        this.modal.style.display = 'block';
        
        // Update hash when opening modal
        window.location.hash = `thought-${thought.id}`;
    }

    createThoughtUrl(thought) {
        // Create URL with hash instead of path
        return `${window.location.origin}${window.location.pathname}#thought-${thought.id}`;
    }

    async copyToClipboard(text, thought) {
        try {
            await navigator.clipboard.writeText(text);
            // Update hash
            window.location.hash = `thought-${thought.id}`;
            this.showShareSuccess('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            // Update hash
            window.location.hash = `thought-${thought.id}`;
            this.showShareSuccess('Link copied to clipboard!');
        }
    }

    shareViaEmail(thought, url) {
        const subject = encodeURIComponent('Shared Thought from Heart');
        const body = encodeURIComponent(
            `I wanted to share this thought with you:\n\n` +
            `"${thought.content}"\n\n` +
            `View it here: ${url}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    showShareSuccess(message) {
        // Remove any existing success message
        const existingSuccess = document.querySelector('.share-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const success = document.createElement('div');
        success.className = 'share-success';
        success.textContent = message;
        document.body.appendChild(success);

        setTimeout(() => {
            success.remove();
        }, 3000);
    }

    checkHashForSharedThought() {
        const hash = window.location.hash;
        const matches = hash.match(/#thought-(\d+)/);
        
        if (matches) {
            const thoughtId = parseInt(matches[1]);
            const thought = this.thoughts.find(t => t.id === thoughtId);
            
            if (thought) {
                this.openModal(thought);
            }
        } else if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ThoughtsManager');
    new ThoughtsManager();
}); 