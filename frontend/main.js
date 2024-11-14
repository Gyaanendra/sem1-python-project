// Mobile menu toggle
function toggleMobileMenu() {
  const navLinks = document.getElementById("nav-links");
  const navAuth = document.getElementById("nav-auth");
  navLinks.classList.toggle("active");
  navAuth.classList.toggle("active");
}

// General utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Add any general initialization code here
});
