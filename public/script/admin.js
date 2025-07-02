document.addEventListener('DOMContentLoaded', async () => {
    checkAdminAccess();
    await fetchPendingCharities();
  });
  
  // ✅ Function to check if the user is an admin
  function checkAdminAccess() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
    if (!isAdmin) {
      alert('Access denied.');
      window.location.href = '/html/home.html';
    }
  }
  
  // ✅ Function to fetch and display pending charities
  async function fetchPendingCharities() {
    const charityList = document.getElementById('charityList');
    const token = localStorage.getItem('token');
  
    try {
        const res = await fetch('/api/admin/charities/pending', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || 'Failed to load charities');
  
      if (data.length === 0) {
        charityList.innerHTML = `<div class="col-12 text-center text-muted">No pending charities found.</div>`;
        return;
      }
  
      charityList.innerHTML = data.map(charity => `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow border-0 h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary">
                <i class="bi bi-building me-2"></i>${charity.name}
              </h5>
              <p><i class="bi bi-envelope-fill me-2 text-danger"></i><strong>Email:</strong> ${charity.email}</p>
              <p><i class="bi bi-telephone-fill me-2 text-success"></i><strong>Phone:</strong> ${charity.phone || 'N/A'}</p>
              <p><i class="bi bi-card-text me-2 text-info"></i><strong>Description:</strong> ${charity.description}</p>
              <p><i class="bi bi-bullseye me-2 text-secondary"></i><strong>Mission:</strong> ${charity.mission || 'N/A'}</p>
              <p><i class="bi bi-flag me-2 text-warning"></i><strong>Goals:</strong> ${charity.goals || 'N/A'}</p>
              <p><i class="bi bi-kanban me-2 text-info"></i><strong>Projects:</strong> ${charity.projects || 'N/A'}</p>

              <div class="mt-auto text-end">
                <span 
  class="badge bg-warning text-dark status-badge"
  data-id="${charity.id}"
  style="cursor: pointer;"
>
  <i class="bi bi-hourglass-split me-1"></i>${charity.status}
</span>

              </div>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
      charityList.innerHTML = `<div class="col-12 text-danger text-center">Failed to load charities.</div>`;
    }
  }
  
  let selectedCharityId = null;

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('status-badge')) {
    selectedCharityId = e.target.dataset.id;
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
  }
});

document.getElementById('approveBtn').addEventListener('click', () => updateStatus('approved'));
document.getElementById('rejectBtn').addEventListener('click', () => updateStatus('rejected'));


async function updateStatus(status) {
  const token = localStorage.getItem('token');

  // Show confirmation alert
  const confirmAction = confirm(`Are you sure you want to ${status} this charity?`);

  if (!confirmAction) return; // If canceled, exit the function

  try {
    const res = await fetch(`/api/admin/charities/${selectedCharityId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to update status');

    alert(`Charity has been successfully ${status}.`);
    location.reload(); // Refresh to show updated status
  } catch (err) {
    console.error(err);
    alert('Failed to update status');
  }
}
