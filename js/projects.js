// Projects & Filtering Module

function initProjects() {
    // Add overlay to project cards
    document.querySelectorAll('.project-card').forEach(card => {
        const overlay = document.createElement('div');
        overlay.className = 'project-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <div class="project-overlay-text" data-es="Ver más en<br>Behance" data-en="See more on<br>Behance">See more on<br>Behance</div>
                <button class="project-overlay-btn" data-en="View" data-es="Ver" style="cursor: pointer;">View</button>
            </div>
        `;

        const projectImage = card.querySelector('.project-image');
        if (projectImage) {
            projectImage.appendChild(overlay);
        }
    });

    // Project Filter Functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const filterType = this.getAttribute('data-filter');

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter project cards
            document.querySelectorAll('.project-card').forEach(card => {
                if (filterType === 'all' || card.getAttribute('data-type') === filterType) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
} else {
    initProjects();
}
