document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const navList = document.querySelector('.navbar-nav');

  // Function to build the logged-in navbar
  function updateNavbar(userName, userType) {
    if (!navList) return;

    // Clear all existing items (removes duplicates and old menu links)
    navList.innerHTML = '';

    // Add one DONATE NOW button
    const donateItem = document.createElement('li');
    donateItem.className = 'nav-item me-3';
    donateItem.innerHTML = `<a class="btn donate-btn ms-2" href="donate.html">DONATE NOW</a>`;

    // Add DASHBOARD (based on user type)
    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'nav-item';
    const dashboardPage =
      userType === 'student'
        ? 'student-dashboard.html'
        : userType === 'funder'
        ? 'funder-dashboard.html'
        : 'admin-dashboard.html';
    dashboardItem.innerHTML = `<a class="nav-link" href="${dashboardPage}">DASHBOARD</a>`;

    // Add dynamic Welcome message
    const welcomeItem = document.createElement('li');
    welcomeItem.className = 'nav-item';
    welcomeItem.innerHTML = `<span class="nav-link fw-bold">Welcome, ${userName}</span>`;

    // Add LOGOUT button
    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item';
    logoutItem.innerHTML = `<button class="btn btn-outline-light ms-2" id="logoutBtn">LOGOUT</button>`;

    // Append all to the navbar
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

  // Handle logged-out state (default navbar)
  function showDefaultNavbar() {
    if (!navList) return;
    navList.innerHTML = `
      <li class="nav-item"><a class="btn donate-btn ms-2" href="donate.html">DONATE NOW</a></li>
      <li class="nav-item"><a class="nav-link" href="students.html">STUDENTS</a></li>
      <li class="nav-item"><a class="nav-link" href="funders.html">FUNDERS</a></li>
      <li class="nav-item"><a class="nav-link" href="about.html">ABOUT US</a></li>
      <li class="nav-item" id="login-area"><a class="btn btn-outline-light ms-2" href="login.html">LOGIN</a></li>
    `;
  }

  // Authentication changes
  auth.onAuthStateChanged(user => {
    if (user) {
      const storedName = localStorage.getItem('userName') || user.displayName || 'User';
      const storedType = localStorage.getItem('userType') || 'student';
      updateNavbar(storedName, storedType);
    } else {
      showDefaultNavbar();
    }
  });
});
