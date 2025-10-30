document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const navList = document.querySelector('.navbar-nav');

  function updateNavbar(userName, userType) {
    if (!navList) return;

    // Remove existing menu items (STUDENTS, FUNDERS, etc.)
    navList.innerHTML = '';

    // Add the main DONATE NOW button
    const donateItem = document.createElement('li');
    donateItem.className = 'nav-item me-3';
    donateItem.innerHTML = `<a class="btn donate-btn ms-2" href="donate.html">DONATE NOW</a>`;

    // Add DASHBOARD (based on user type)
    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'nav-item';
    const dashboardPage = userType === 'student'
      ? 'student-dashboard.html'
      : userType === 'funder'
      ? 'funder-dashboard.html'
      : 'admin-dashboard.html';
    dashboardItem.innerHTML = `<a class="nav-link" href="${dashboardPage}">DASHBOARD</a>`;

    // Add the welcome message
    const welcomeItem = document.createElement('li');
    welcomeItem.className = 'nav-item';
    welcomeItem.innerHTML = `<span class="nav-link fw-bold">Welcome, ${userName}</span>`;

    // Add LOGOUT button
    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item';
    logoutItem.innerHTML = `<button class="btn btn-outline-light ms-2" id="logoutBtn">LOGOUT</button>`;

    // Append all items to navbar
    navList.appendChild(donateItem);
    navList.appendChild(dashboardItem);
    navList.appendChild(welcomeItem);
    navList.appendChild(logoutItem);

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await auth.signOut();
      localStorage.removeItem('userType');
      localStorage.removeItem('userName');
      window.location.href = 'index.html';
    });
  }

  // Load stored info from login
  const storedName = localStorage.getItem('userName');
  const storedType = localStorage.getItem('userType');

  if (storedName && storedType) {
    updateNavbar(storedName, storedType);
  }

  // Sync with Firebase
  auth.onAuthStateChanged(user => {
    if (user) {
      const displayName =
        localStorage.getItem('userName') ||
        user.displayName ||
        'User';
      const userType = localStorage.getItem('userType') || 'student';
      updateNavbar(displayName, userType);
    }
  });
});

