// Books page specific functionality
async function fetchAndDisplayBooks() {
  const booksContainer = document.getElementById("books-container");

  try {
    showLoading();
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error("Failed to fetch books");

    const books = await response.json();
    booksContainer.innerHTML = books
      .map((book) => createBookCard(book))
      .join("");
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML =
      '<div class="loading">Error loading books. Please try again later.</div>';
  }
}

function createBookCard(book) {
  return `
       <div class="book-card" onclick="openBookModal(${JSON.stringify(
         book
       ).replace(/"/g, "&quot;")})">
           <div class="book-image-wrapper">
               <img src="${
                 book.thumbnail || "placeholder-image-url.jpg"
               }" alt="${book.title}" class="book-image">
           </div>
           <div class="book-content">
               <h3 class="book-title">${book.title}</h3>
               <p class="book-author">by ${book.authors || "Unknown Author"}</p>
               <div class="book-rating">
                   <div class="stars">
                       ${createStarRating(book.average_rating)}
                   </div>
                   <span>${
                     book.average_rating
                       ? book.average_rating.toFixed(1)
                       : "N/A"
                   }</span>
               </div>
               <div class="book-meta">
                   ${
                     book.published_year
                       ? `<span class="meta-tag">${book.published_year}</span>`
                       : ""
                   }
                   ${
                     book.num_pages
                       ? `<span class="meta-tag">${book.num_pages} pages</span>`
                       : ""
                   }
               </div>
           </div>
       </div>
   `;
}

function createStarRating(rating) {
  if (!rating) return "☆☆☆☆☆";
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = "★".repeat(fullStars);
  if (halfStar) stars += "½";
  stars += "☆".repeat(5 - Math.ceil(rating));
  return stars;
}

function openBookModal(book) {
  const modal = document.createElement("div");
  modal.className = "book-modal-overlay";
  modal.innerHTML = `
       <div class="book-modal">
           <button class="modal-close" onclick="closeBookModal(this)">&times;</button>
           <div class="modal-image-section">
               <div class="modal-image-wrapper">
                   <img src="${
                     book.thumbnail || "placeholder-image-url.jpg"
                   }" alt="${book.title}" class="modal-image">
               </div>
           </div>
           <div class="modal-content">
               <h2 class="modal-title">${book.title}</h2>
               ${
                 book.subtitle
                   ? `<p class="modal-subtitle">${book.subtitle}</p>`
                   : ""
               }
               
               <div class="modal-info">
                   <div class="info-item">
                       <span class="info-label">Author:</span>
                       <span>${book.authors || "Unknown Author"}</span>
                   </div>
                   <div class="info-item">
                       <span class="info-label">Rating:</span>
                       <span>${createStarRating(book.average_rating)} (${
    book.average_rating ? book.average_rating.toFixed(1) : "N/A"
  })</span>
                   </div>
                   <div class="info-item">
                       <span class="info-label">Published:</span>
                       <span>${book.published_year || "Unknown"}</span>
                   </div>
                   <div class="info-item">
                       <span class="info-label">Pages:</span>
                       <span>${book.num_pages || "Unknown"}</span>
                   </div>
                   ${
                     book.isbn
                       ? `
                   <div class="info-item">
                       <span class="info-label">ISBN:</span>
                       <span>${book.isbn}</span>
                   </div>
                   `
                       : ""
                   }
               </div>

               <div class="modal-description">
                   ${book.description || "No description available."}
               </div>

               ${
                 book.categories
                   ? `
               <div class="modal-categories">
                   ${book.categories
                     .split(",")
                     .map(
                       (category) =>
                         `<span class="category-tag">${category.trim()}</span>`
                     )
                     .join("")}
               </div>
               `
                   : ""
               }
           </div>
       </div>
   `;

  document.body.appendChild(modal);
  setTimeout(() => (modal.style.display = "flex"), 10);
  document.body.style.overflow = "hidden";
}

function closeBookModal(button) {
  const modal = button.closest(".book-modal-overlay");
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.remove();
    document.body.style.overflow = "";
  }, 300);
}

function showLoading() {
  const booksContainer = document.getElementById("books-container");
  booksContainer.innerHTML = '<div class="loading">Loading books...</div>';
}

// Search and filter functionality
function setupSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");

  searchInput.addEventListener("input", debounce(handleSearch, 300));
  categoryFilter.addEventListener("change", handleFilter);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function handleSearch() {
  // Implement search functionality
}

function handleFilter() {
  // Implement filter functionality
}

// Initialize books page
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayBooks();
  setupSearchAndFilter();
});
