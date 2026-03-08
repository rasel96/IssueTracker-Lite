const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const user = usernameInput.value;
  const pass = passwordInput.value;

  if (user === 'admin' && pass === 'admin123') {
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = 'dashboard.html';
  }
});
