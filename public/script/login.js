document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const warningDiv = document.getElementById('warning');
    warningDiv.classList.add('d-none');
    warningDiv.innerText = '';

    try {
        const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Invalid email or password');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token in localStorage
        localStorage.setItem('userId', data.userId); // <-- this stores userId
        localStorage.setItem('userName', data.userName);
        localStorage.setItem('isAdmin', data.isAdmin); // <-- Important
        localStorage.setItem('email', data.email); // only if you return it in res

        alert('Login successful!');

         // ✅ Redirect based on admin status
         if (data.isAdmin) {
            window.location.href = '/html/admin.html'; // Admin dashboard
        } else {
            window.location.href = '/html/home.html'; // Normal user dashboard
        }

    } catch (err) {
        warningDiv.classList.remove('d-none');
        warningDiv.innerText = err.message;
    }
});