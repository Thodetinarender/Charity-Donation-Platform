document.addEventListener('DOMContentLoaded', async () => {
  const profileDetails = document.getElementById('profile-details');
  const logoutBtn = document.getElementById('logout-btn');
  const profileForm = document.getElementById('profile-form');
  const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));

  // Fetch and display user profile
  async function loadProfile() {
    try {
      const response = await fetch('/api/v1/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const user = await response.json();
      profileDetails.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Name: ${user.name}</h5>
            <p class="card-text">Email: ${user.email}</p>
            <p class="card-text">Phone: ${user.phone}</p>
            <p class="card-text">Address: ${user.street}, ${user.apartment}, ${user.city}, ${user.zip}, ${user.country}</p>
          </div>
        </div>
      `;

      // Pre-fill the modal form with user data
      document.getElementById('name').value = user.name;
      document.getElementById('street').value = user.street || '';
      document.getElementById('apartment').value = user.apartment || '';
      document.getElementById('zip').value = user.zip || '';
      document.getElementById('city').value = user.city || '';
      document.getElementById('country').value = user.country || '';
      document.getElementById('career-goals').value = user.careerGoals || '';
    } catch (err) {
      profileDetails.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    }
  }

  // Load profile on page load
  loadProfile();

  // Handle profile form submission
  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const profileData = {
      name: document.getElementById('name').value,
      street: document.getElementById('street').value,
      apartment: document.getElementById('apartment').value,
      zip: document.getElementById('zip').value,
      city: document.getElementById('city').value,
      country: document.getElementById('country').value,
      careerGoals: document.getElementById('career-goals').value,
    };

    try {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      alert('Profile updated successfully!');
      profileModal.hide(); // Close the modal
      loadProfile(); // Reload the profile details
    } catch (error) {
      console.error('Error:', error.message);
      alert('An error occurred while updating the profile. Please try again.');
    }
  });

  // Logout functionality
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    window.location.href = '/login';
  });
});
