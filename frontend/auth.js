const API_URL = "http://127.0.0.1:8000/api";
let currentUser = null;

// Create modal HTML dynamically
function createAuthModals() {
  const modalHTML = `
        <!-- Login Modal -->
        <div id="login-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal" onclick="hideLogin()">&times;</span>
                <h2>Login</h2>
                <form id="login-form" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <button type="submit" class="auth-button">Login</button>
                </form>
                <div class="auth-links">
                    <p>Don't have an account? <a href="#" onclick="hideLogin(); showSignup();">Sign Up</a></p>
                </div>
            </div>
        </div>

        <!-- Signup Modal -->
        <div id="signup-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal" onclick="hideSignup()">&times;</span>
                <h2>Create Account</h2>
                <form id="signup-form" onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="firstname">First Name</label>
                        <input type="text" id="firstname" required>
                    </div>
                    <div class="form-group">
                        <label for="lastname">Last Name</label>
                        <input type="text" id="lastname" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email</label>
                        <input type="email" id="signup-email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" required>
                    </div>
                    <button type="submit" class="auth-button">Sign Up</button>
                </form>
                <div class="auth-links">
                    <p>Already have an account? <a href="#" onclick="hideSignup(); showLogin();">Login</a></p>
                </div>
            </div>
        </div>
    `;

  // Add modals to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Add these styles to your CSS
const modalStyles = `
    .auth-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        width: 90%;
        max-width: 400px;
        position: relative;
        animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .close-modal {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s;
    }

    .close-modal:hover {
        color: #333;
    }
`;

// Add styles to document
function addModalStyles() {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = modalStyles;
  document.head.appendChild(styleSheet);
}

// Authentication UI Functions
function showLogin() {
  const modal = document.getElementById("login-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function hideLogin() {
  const modal = document.getElementById("login-modal");
  modal.style.display = "none";
  document.body.style.overflow = "";
  document.getElementById("login-form").reset();
}

function showSignup() {
  const modal = document.getElementById("signup-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function hideSignup() {
  const modal = document.getElementById("signup-modal");
  modal.style.display = "none";
  document.body.style.overflow = "";
  document.getElementById("signup-form").reset();
}

function updateAuthDisplay(isLoggedIn, username = "") {
  const userInfo = document.querySelector(".user-info");
  const loginButton = document.getElementById("login-button");
  const signupButton = document.getElementById("signup-button");
  const userNameSpan = document.getElementById("user-name");

  if (isLoggedIn) {
    userInfo.style.display = "flex";
    loginButton.style.display = "none";
    signupButton.style.display = "none";
    userNameSpan.textContent = username;
    // Store user state
    localStorage.setItem("user", JSON.stringify(currentUser));
  } else {
    userInfo.style.display = "none";
    loginButton.style.display = "block";
    signupButton.style.display = "block";
    // Clear user state
    localStorage.removeItem("user");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const userData = await response.json();
    currentUser = userData;
    updateAuthDisplay(true, userData.firstname);
    hideLogin();

    // Show success notification
    showNotification("Successfully logged in!", "success");
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Login failed. Please check your credentials.", "error");
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const userData = {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    email: document.getElementById("signup-email").value,
    password: document.getElementById("signup-password").value,
  };

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Signup failed");

    const data = await response.json();
    currentUser = data;
    updateAuthDisplay(true, data.firstname);
    hideSignup();

    // Show success notification
    showNotification("Account created successfully!", "success");
  } catch (error) {
    console.error("Signup error:", error);
    showNotification("Signup failed. Please try again.", "error");
  }
}

function logout() {
  currentUser = null;
  updateAuthDisplay(false);
  showNotification("Successfully logged out!", "success");
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => notification.classList.add("show"), 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize auth state
document.addEventListener("DOMContentLoaded", () => {
  // Add modals and styles
  createAuthModals();
  addModalStyles();

  // Check for stored user
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    updateAuthDisplay(true, currentUser.firstname);
  } else {
    updateAuthDisplay(false);
  }

  // Close modals when clicking outside
  window.onclick = function (event) {
    if (event.target.classList.contains("auth-modal")) {
      hideLogin();
      hideSignup();
    }
  };
});
