document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('charityForm');
    const messageDiv = document.getElementById('formMessage');
    const charityList = document.getElementById('charityList');
  
    // Fetch user's charities on page load
    fetchCharities();
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('charityName').value;
      const email = document.getElementById('charityEmail').value;
      const phone = document.getElementById('charityPhone').value;
      const description = document.getElementById('charityDescription').value;
      const mission = document.getElementById('charityMission').value;
      const goals = document.getElementById('charityGoals').value;
      const projects = document.getElementById('charityProjects').value;
      const street = document.getElementById('charityStreet').value;
      const apartment = document.getElementById('charityApartment').value;
      const zip = document.getElementById('charityZip').value;
      const city = document.getElementById('charityCity').value;
      const country = document.getElementById('charityCountry').value;

      
  
      try {
        const token = localStorage.getItem('token');
  
        const res = await fetch('/api/charities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, email, phone, description, mission, goals, projects, street, apartment, zip, city, country })
        });
  
        const data = await res.json();
  
        if (res.ok) {
          messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          form.reset();
  
          setTimeout(() => {
            const modalElement = document.getElementById('createCharityModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            messageDiv.innerHTML = '';
          }, 1500);
  
          // Refresh the list after submission
          fetchCharities();
        } else {
          messageDiv.innerHTML = `<div class="alert alert-danger">${data.error || 'Submission failed'}</div>`;
        }
      } catch (err) {
        console.error(err);
        messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred</div>`;
      }
    });
  
    // 🔥 Function to fetch and display user's charities
    async function fetchCharities() {
        try {
          const token = localStorage.getItem('token');
      
          const res = await fetch('/api/charities/mine', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      
          const data = await res.json();
      
          if (res.ok) {
            if (data.length === 0) {
              charityList.innerHTML = `
                <div class="col-12">
                  <div class="alert alert-warning text-center">No charities registered yet.</div>
                </div>`;
              return;
            }
           // Build cards
charityList.innerHTML = data.map(charity => {
  let statusClass = '';
  let statusIcon = '';
  let statusLabel = '';

  switch (charity.status) {
    case 'approved':
      statusClass = 'bg-success';
      statusIcon = 'bi-check-circle';
      statusLabel = 'Approved';
      break;
    case 'rejected':
      statusClass = 'bg-danger';
      statusIcon = 'bi-x-circle';
      statusLabel = 'Rejected';
      break;
    default:
      statusClass = 'bg-warning text-dark';
      statusIcon = 'bi-hourglass-split';
      statusLabel = 'Pending Approval';
  }

  return `
  <div class="col-md-6 col-lg-4">
    <div class="card shadow border-0 h-100">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start">
          <h5 class="card-title text-primary">
            <i class="bi bi-building me-2"></i>${charity.name}
          </h5>
          <div class="dropdown">
            <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item text-primary" href="/html/charityProfile.html?id=${charity.id}">
                  <i class="bi bi-person-lines-fill me-2"></i>Profile
                </a>

              </li>
            </ul>
          </div>
        </div>
          <p><i class="bi bi-envelope-fill me-2 text-danger"></i><strong>Email:</strong> ${charity.email}</p>
          <p><i class="bi bi-telephone-fill me-2 text-success"></i><strong>Phone:</strong> ${charity.phone || 'N/A'}</p>
          <p><i class="bi bi-card-text me-2 text-info"></i><strong>Description:</strong> ${charity.description}</p>
          <p><i class="bi bi-bullseye me-2 text-secondary"></i><strong>Mission:</strong> ${charity.mission || 'N/A'}</p>
          <p><i class="bi bi-flag me-2 text-warning"></i><strong>Goals:</strong> ${charity.goals || 'N/A'}</p>
          <p><i class="bi bi-kanban me-2 text-info"></i><strong>Projects:</strong> ${charity.projects || 'N/A'}</p>

          <div class="mt-auto text-end">
            <span 
              class="badge ${statusClass} status-badge" 
              data-id="${charity.id}" 
              style="cursor: pointer;"
            >
              <i class="bi ${statusIcon} me-1"></i>${statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}).join('');

              
          } else {
            charityList.innerHTML = `
              <div class="col-12">
                <div class="alert alert-danger text-center">Failed to fetch charities.</div>
              </div>`;
          }
        } catch (err) {
          console.error(err);
          charityList.innerHTML = `
            <div class="col-12">
              <div class="alert alert-danger text-center">An error occurred while loading charities.</div>
            </div>`;
        }
      }
      
      
  });
  