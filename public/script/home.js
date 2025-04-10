document.addEventListener('DOMContentLoaded', async () => {
    // Menu toggle
    document.querySelector('.navbar-toggler').addEventListener('click', function () {
        this.querySelector('.menu-icon_component').classList.toggle('menu-open');
    });

    // Profile redirect
    const profileLink = document.querySelector('a[href="/html/profile.html"]');
    if (profileLink) {
        profileLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/html/profile.html';
        });
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No auth token found. Redirecting to login...');
        window.location.href = '/login';
        return;
    }

    const container = document.createElement('div');
    container.classList.add('container', 'mt-5');
    document.body.appendChild(container);

    const row = document.createElement('div');
    row.classList.add('row');
    container.appendChild(row);

    // Function to load charities
    async function loadCharities(query = '') {
        try {
            const response = await fetch(`/api/charities${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }

            const charities = await response.json();
            row.innerHTML = ''; // Clear previous content

            charities.forEach(charity => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 mb-4';

                col.innerHTML = `
                <div class="card h-100 shadow d-flex flex-column justify-content-between">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary"><i class="bi bi-building"></i> ${charity.name}</h5>
                        <p class="card-text"><i class="bi bi-info-circle"></i> ${charity.description}</p>
                        <hr>
                        <p><i class="bi bi-telephone"></i> <strong>Phone:</strong> ${charity.phone}</p>
                        <p><i class="bi bi-envelope"></i> <strong>Email:</strong> ${charity.email}</p>
                        <p><i class="bi bi-geo-alt"></i> <strong>Location:</strong> ${charity.street}, ${charity.apartment || ''}, ${charity.city}, ${charity.zip}, ${charity.country}</p>
                        <hr>
                        <p><i class="bi bi-lightbulb"></i> <strong>Mission:</strong> ${charity.mission}</p>
                        <p><i class="bi bi-bullseye"></i> <strong>Goals:</strong> ${charity.goals}</p>
                        <p><i class="bi bi-diagram-3"></i> <strong>Projects:</strong> ${charity.projects}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-end">
                      <button class="btn btn-outline-success btn-sm donate-btn" data-charity-id="${charity.id}">
                       <i class="bi bi-cash-coin"></i> Donate Now
                      </button>
                    </div>
                </div>
                `;
                row.appendChild(col);
            });

        } catch (error) {
            console.error('Failed to fetch charities:', error);
        }
    }

    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.donate-btn')) {
            const charityId = e.target.closest('.donate-btn').dataset.charityId;
            window.location.href = `/html/donate.html?charityId=${charityId}`;
        }
    });
    

    // Load all initially
    await loadCharities('/approved');

    // Filter button event
    document.getElementById('filterBtn').addEventListener('click', async () => {
        const name = document.getElementById('searchName').value;
        const city = document.getElementById('searchCity').value;
    
        const queryParams = new URLSearchParams();
        if (name) queryParams.append('name', name);
        if (city) queryParams.append('city', city);
    
        const query = queryParams.toString() ? `/search?${queryParams.toString()}` : '/approved';
        await loadCharities(query);
    });
    
});
