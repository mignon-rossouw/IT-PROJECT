// navbar-auth.js - Dynamic Navbar Authentication for FundMyFuture
document.addEventListener('DOMContentLoaded', () => {
  console.log('Navbar auth initializing...');

  // Function to check if Firebase is available
  function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && 
           firebase.apps && 
           firebase.apps.length > 0 &&
           firebase.auth;
  }

  // Function to initialize navbar auth
  function initializeNavbarAuth() {
    if (!isFirebaseAvailable()) {
      console.log('Firebase not available in global scope, using session storage fallback');
      setupBasicAuth();
      return;
    }

    try {
      console.log('Firebase is available, setting up auth listener...');
      setupFirebaseAuth();
    } catch (error) {
      console.error('Firebase auth setup failed:', error);
      setupBasicAuth();
    }
  }

  // Setup Firebase authentication
  function setupFirebaseAuth() {
    const auth = firebase.auth();
    const navList = document.querySelector('.navbar-nav');

    // Check if navbar element exists
    if (!navList) {
      console.error('Navbar element not found. Please ensure .navbar-nav exists.');
      setupBasicAuth();
      return;
    }

    // Authentication state observer
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);
        
        // Get user data from localStorage (set during login)
        const storedName = localStorage.getItem('userName') || 'User';
        const storedType = localStorage.getItem('userType') || 'student';
        
        // Verify the stored UID matches the current user
        const storedUID = localStorage.getItem('userUID');
        if (storedUID && storedUID !== user.uid) {
          console.warn("Stored UID doesn't match current user. Clearing data.");
          handleLogout();
          return;
        }
        
        updateNavbar(storedName, storedType);
      } else {
        // User is signed out
        console.log("User is signed out");
        
        // Clear any residual data (security measure)
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        localStorage.removeItem('userUID');
        
        showDefaultNavbar();
      }
    });

    // Additional security: Check if user data is consistent on page load
    function validateUserSession() {
      const currentUser = auth.currentUser;
      const storedUID = localStorage.getItem('userUID');
      
      if (currentUser && storedUID && currentUser.uid !== storedUID) {
        console.warn("Session inconsistency detected. Logging out.");
        handleLogout();
      }
    }

    // Run validation on page load
    validateUserSession();
  }

  // Function to build the logged-in navbar
  function updateNavbar(userName, userType) {
    const navList = document.querySelector('.navbar-nav');
    if (!navList) {
      console.error('Navbar element not found for update');
      return;
    }

    // Clear all existing items
    navList.innerHTML = '';

    // Add DONATE NOW button
    const donateItem = document.createElement('li');
    donateItem.className = 'nav-item me-3';
    donateItem.innerHTML = `<a class="btn donate-btn ms-2" href="donate.html">DONATE NOW</a>`;

    // Add DASHBOARD (based on user type)
    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'nav-item';
    const dashboardPage = getUserDashboardPage(userType);
    dashboardItem.innerHTML = `<a class="nav-link" href="${dashboardPage}">DASHBOARD</a>`;

    // Add dynamic Welcome message with first name only
    const welcomeItem = document.createElement('li');
    welcomeItem.className = 'nav-item';
    const firstName = getUserFirstName(userName);
    welcomeItem.innerHTML = `<span class="nav-link fw-bold">Welcome, ${firstName}</span>`;

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
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    console.log('Navbar updated for logged-in user:', firstName);
  }

  // Helper function to get dashboard page based on user type
  function getUserDashboardPage(userType) {
    switch(userType) {
      case 'student': 
        return 'student-dashboard.html';
      case 'funder': 
        return 'funder-dashboard.html';
      case 'admin': 
        return 'admin-dashboard.html';
      default: 
        return 'index.html';
    }
  }

  // Helper function to extract first name from full name
  function getUserFirstName(fullName) {
    if (!fullName || fullName === 'User') return 'User';
    return fullName.split(' ')[0];
  }

  // Handle logout process
  async function handleLogout() {
    try {
      console.log("Logging out user...");
      
      // Try Firebase logout if available
      if (isFirebaseAvailable()) {
        await firebase.auth().signOut();
      }
      
      // Clear all user data from localStorage
      localStorage.removeItem('userType');
      localStorage.removeItem('userName');
      localStorage.removeItem('userUID');
      
      console.log("Logout successful, redirecting to home page...");
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error with Firebase logout, clear local data and redirect
      localStorage.removeItem('userType');
      localStorage.removeItem('userName');
      localStorage.removeItem('userUID');
      window.location.href = 'index.html';
    }
  }

  // Handle logged-out state (default navbar)
  function showDefaultNavbar() {
    const navList = document.querySelector('.navbar-nav');
    if (!navList) {
      console.error('Navbar element not found for default setup');
      return;
    }
    
    navList.innerHTML = `
      <li class="nav-item me-3">
        <a class="btn donate-btn ms-2" href="donate.html">DONATE NOW</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="sign-up-funderStudent.html">STUDENTS</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="sign-up-funderStudent.html">FUNDERS</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="about.html">ABOUT US</a>
      </li>
      <li class="nav-item me-2" id="login-area">
        <a class="btn login-btn fw-bolder" href="login.html">LOGIN</a>
      </li>
    `;
    
    console.log('Default navbar setup completed');
  }

  // Setup basic authentication using session storage
  function setupBasicAuth() {
    console.log('Setting up basic auth using session storage...');
    
    // Check if user data exists in storage
    const storedName = localStorage.getItem('userName');
    const storedType = localStorage.getItem('userType');
    const storedUID = localStorage.getItem('userUID');
    
    if (storedName && storedType && storedUID) {
      // User appears to be logged in
      updateNavbar(storedName, storedType);
    } else {
      // User is not logged in
      showDefaultNavbar();
    }
    
    // Attach logout handler to any existing logout buttons
    const existingLogoutBtn = document.getElementById('logoutBtn');
    if (existingLogoutBtn) {
      existingLogoutBtn.addEventListener('click', handleLogout);
    }
  }

  // Wait a bit for Firebase to load, then initialize
  setTimeout(() => {
    initializeNavbarAuth();
  }, 100);

  // Also try initializing after a longer delay as fallback
  setTimeout(() => {
    const navList = document.querySelector('.navbar-nav');
    if (navList && navList.children.length === 0) {
      console.log('Navbar still empty after 1 second, forcing basic setup');
      setupBasicAuth();
    }
  }, 1000);

  console.log("Navbar authentication system initialized");
});