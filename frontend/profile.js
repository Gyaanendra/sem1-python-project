document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadProfileData();
  loadUserStats();
  loadCurrentBooks();
  loadActivity();
  loadReviews();
});

function loadProfileData() {
  const user = JSON.parse(localStorage.getItem("user"));
  document.getElementById(
    "profile-full-name"
  ).textContent = `${user.firstname} ${user.lastname}`;
  document.getElementById("profile-email").textContent = user.email;
  // Load avatar if exists
  if (user.avatar) {
    document.getElementById("profile-avatar").src = user.avatar;
  }
}

async function loadUserStats() {
  try {
    const response = await fetch(`${API_URL}/user/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const stats = await response.json();
    updateStats(stats);
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function updateStats(stats) {
  // Update stats display
  document.querySelector(".stats-list").innerHTML = `
       <div class="stat-item">
           <i class="fas fa-book-reader"></i>
           <div class="stat-info">
               <span class="stat-number">${stats.booksRead || 0}</span>
               <span class="stat-label">Books Read</span>
           </div>
       </div>
       <div class="stat-item">
           <i class="fas fa-bookmark"></i>
           <div class="stat-info">
               <span class="stat-number">${stats.currentlyReading || 0}</span>
               <span class="stat-label">Reading Now</span>
           </div>
       </div>
       <div class="stat-item">
           <i class="fas fa-list"></i>
           <div class="stat-info">
               <span class="stat-number">${stats.wantToRead || 0}</span>
               <span class="stat-label">Want to Read</span>
           </div>
       </div>
   `;
}

function showEditProfileModal() {
  const modal = document.getElementById("edit-profile-modal");
  const user = JSON.parse(localStorage.getItem("user"));

  // Pre-fill form
  document.getElementById("edit-firstname").value = user.firstname;
  document.getElementById("edit-lastname").value = user.lastname;
  document.getElementById("edit-bio").value = user.bio || "";

  modal.style.display = "flex";
}

function hideEditProfileModal() {
  document.getElementById("edit-profile-modal").style.display = "none";
}

async function handleProfileUpdate(event) {
  event.preventDefault();

  const userData = {
    firstname: document.getElementById("edit-firstname").value,
    lastname: document.getElementById("edit-lastname").value,
    bio: document.getElementById("edit-bio").value,
  };

  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Update failed");

    const updatedUser = await response.json();
    localStorage.setItem("user", JSON.stringify(updatedUser));
    loadProfileData();
    hideEditProfileModal();
    showNotification("Profile updated successfully!", "success");
  } catch (error) {
    console.error("Update error:", error);
    showNotification("Failed to update profile", "error");
  }
}

// Add these functions to handle the dropdown menu
function toggleDropdown() {
  const dropdown = document.getElementById("user-dropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.matches(".dropdown-btn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let dropdown of dropdowns) {
      if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
      }
    }
  }
};
