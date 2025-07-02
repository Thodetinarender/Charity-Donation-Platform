document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const charityId = urlParams.get('id');
    const token = localStorage.getItem('token');
  
    if (!charityId || !token) {
      alert('Missing charity ID or not authenticated.');
      return;
    }
  
    fetch(`/api/charities/${charityId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          document.body.innerHTML = `<div class="container mt-5 alert alert-danger">${data.error}</div>`;
          return;
        }
  
        // Build profile content
        const profileContainer = document.getElementById('charity-profile');
        profileContainer.innerHTML = `
          <div class="card shadow-lg p-4">
            <div class="card-body">
              <h2 class="card-title text-primary mb-4"><i class="bi bi-building"></i> ${data.name}</h2>
  
              <div class="row mb-3">
                <div class="col-md-6"><i class="bi bi-envelope"></i> <strong>Email:</strong> ${data.email}</div>
                <div class="col-md-6"><i class="bi bi-telephone"></i> <strong>Phone:</strong> ${data.phone || 'N/A'}</div>
              </div>
  
              <p><i class="bi bi-info-circle"></i> <strong>Description:</strong><br> ${data.description}</p>
              <p><i class="bi bi-bullseye"></i> <strong>Mission:</strong><br> ${data.mission}</p>
              <p><i class="bi bi-bar-chart"></i> <strong>Goals:</strong><br> ${data.goals}</p>
              <p><i class="bi bi-hammer"></i> <strong>Projects:</strong><br> ${data.projects}</p>
  
              <p><i class="bi bi-geo-alt"></i> <strong>Address:</strong><br> 
                ${data.street || ''} ${data.apartment || ''}, 
                ${data.city || ''}, ${data.zip || ''}, ${data.country || ''}
              </p>
  
              <p><strong>Status:</strong> 
                <span class="badge rounded-pill ${
                  data.status === 'approved'
                    ? 'bg-success'
                    : data.status === 'rejected'
                    ? 'bg-danger'
                    : 'bg-warning text-dark'
                } text-uppercase px-3 py-2">${data.status}</span>
              </p>
            </div>
          </div>
        `;
  
        // Create Edit Button
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-warning mt-3';
        editButton.innerHTML = '<i class="bi bi-pencil-square"></i> Edit Details';
        editButton.setAttribute('data-bs-toggle', 'modal');
        editButton.setAttribute('data-bs-target', '#editCharityModal');
        profileContainer.appendChild(editButton);
  
        // Fill modal inputs when clicking Edit
        editButton.addEventListener('click', () => {
          document.getElementById('edit-name').value = data.name || '';
          document.getElementById('edit-email').value = data.email || '';
          document.getElementById('edit-phone').value = data.phone || '';
          document.getElementById('edit-description').value = data.description || '';
          document.getElementById('edit-mission').value = data.mission || '';
          document.getElementById('edit-goals').value = data.goals || '';
          document.getElementById('edit-projects').value = data.projects || '';
        });
  
        // Handle form submission
        document.getElementById('edit-charity-form').addEventListener('submit', (e) => {
          e.preventDefault();
  
          const updatedCharity = {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            description: document.getElementById('edit-description').value,
            mission: document.getElementById('edit-mission').value,
            goals: document.getElementById('edit-goals').value,
            projects: document.getElementById('edit-projects').value,
            status: 'pending' // Optional: Set to pending on update
          };
  
          fetch(`/api/charities/profile/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedCharity),
          })
            .then(res => res.json())
            .then(response => {
              if (response.error) {
                alert(response.error);
              } else {
                alert('Charity updated and marked as pending!');
                location.reload();
              }
            })
            .catch(err => {
              console.error('Update failed', err);
              alert('Something went wrong while updating.');
            });
        });
  
      })
      .catch(err => {
        console.error(err);
        document.body.innerHTML = `<div class="container mt-5 alert alert-danger">Error loading charity details</div>`;
      });
  });
  