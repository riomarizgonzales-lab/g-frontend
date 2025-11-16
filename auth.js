const API = (window.API_URL || 'http://localhost:5000') + '/api';

// Helper function to show messages
function showMessage(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if(!container) return;
  const className = type === 'success' ? 'alert success' : 'alert error';
  container.innerHTML = `<div class="${className}"><strong>${type === 'success' ? '✓' : '✗'}</strong> ${message}</div>`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if(loginForm){
    loginForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      if(!email || !password) {
        showMessage('message', 'Please fill in all fields');
        return;
      }
      
      try {
        const res = await fetch(`${API}/auth/login`, {
          method:'POST', headers:{'content-type':'application/json'},
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(res.ok){
          showMessage('message', 'Login successful! Redirecting...', 'success');
          localStorage.setItem('blue_user', JSON.stringify(data.user));
          setTimeout(() => {
            if(data.user.role === 'admin') location.href = 'admin.html';
            else location.href = 'dashboard.html';
          }, 1000);
        } else {
          showMessage('message', data.message || 'Login failed');
        }
      } catch(err){
        showMessage('message', 'Connection error: ' + err.message);
      }
    });
  }

  if(signupForm){
    signupForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;
      
      if(!name || !email || !password) {
        showMessage('message', 'Please fill in all fields');
        return;
      }
      
      if(password.length < 4) {
        showMessage('message', 'Password must be at least 4 characters');
        return;
      }
      
      try {
        const res = await fetch(`${API}/auth/signup`, {
          method:'POST', headers:{'content-type':'application/json'},
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if(res.ok){
          showMessage('message', 'Account created! Redirecting to login...', 'success');
          setTimeout(() => {
            location.href = 'login.html';
          }, 1500);
        } else {
          showMessage('message', data.message || 'Signup failed');
        }
      } catch(err){
        showMessage('message', 'Connection error: ' + err.message);
      }
    });
  }
});
