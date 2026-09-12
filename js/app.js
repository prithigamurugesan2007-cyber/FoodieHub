/* FoodieHub — vanilla JavaScript SPA
   Works from a local file and from static hosting.
   Uses History API on http(s), and hash fallback for file:// previews. */
(() => {
  "use strict";

  const app = document.getElementById("app");
  const shell = document.getElementById("site-shell");
  const authScreen = document.getElementById("auth-screen");
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const EXIT_MS = 160;

  const restaurants = [
    { id: 1, name: "Spice Route", cuisine: "Indian", category: "Indian", rating: 4.8, time: "25–35 min", price: "₹₹", location: "Vellore", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85", description: "Comforting Indian classics with bold spices, fresh ingredients and generous portions.", menu: [["Butter Chicken", "₹280"], ["Paneer Tikka", "₹220"], ["Garlic Naan", "₹70"], ["Biryani", "₹240"]] },
    { id: 2, name: "Urban Pizza", cuisine: "Italian", category: "Pizza", rating: 4.7, time: "20–30 min", price: "₹₹", location: "Vellore", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85", description: "Crispy bases, stretchy cheese and fresh toppings made for sharing.", menu: [["Margherita", "₹250"], ["Farmhouse", "₹320"], ["Pepperoni", "₹360"], ["Garlic Bread", "₹140"]] },
    { id: 3, name: "Burger Barn", cuisine: "American", category: "Burgers", rating: 4.6, time: "15–25 min", price: "₹₹", location: "Vellore", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", description: "Juicy burgers, crispy sides and indulgent comfort food.", menu: [["Classic Burger", "₹210"], ["Cheese Burger", "₹240"], ["Chicken Burger", "₹260"], ["Fries", "₹120"]] },
    { id: 4, name: "Green Bowl", cuisine: "Healthy", category: "Healthy", rating: 4.5, time: "15–25 min", price: "₹₹", location: "Vellore", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", description: "Fresh bowls, colourful salads and balanced meals for everyday eating.", menu: [["Power Bowl", "₹230"], ["Avocado Salad", "₹260"], ["Quinoa Bowl", "₹240"], ["Fresh Juice", "₹120"]] },
    { id: 5, name: "Wok & Roll", cuisine: "Asian", category: "Asian", rating: 4.7, time: "20–30 min", price: "₹₹", location: "Vellore", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85", description: "A lively Asian kitchen serving noodles, rice bowls and wok-tossed favorites.", menu: [["Hakka Noodles", "₹190"], ["Schezwan Rice", "₹210"], ["Manchurian", "₹180"], ["Spring Rolls", "₹140"]] },
    { id: 6, name: "Sweet Story", cuisine: "Desserts", category: "Desserts", rating: 4.9, time: "10–20 min", price: "₹", location: "Vellore", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85", description: "Cakes, waffles and sweet treats for the perfect ending.", menu: [["Chocolate Cake", "₹180"], ["Belgian Waffle", "₹210"], ["Brownie", "₹130"], ["Ice Cream", "₹110"]] }
  ];

  const categories = [
    { name: "Indian", icon: "🍛", count: "12 restaurants" },
    { name: "Pizza", icon: "🍕", count: "8 restaurants" },
    { name: "Burgers", icon: "🍔", count: "7 restaurants" },
    { name: "Asian", icon: "🍜", count: "9 restaurants" },
    { name: "Healthy", icon: "🥗", count: "6 restaurants" },
    { name: "Desserts", icon: "🍰", count: "11 restaurants" },
    { name: "Cafés", icon: "☕", count: "5 restaurants" },
    { name: "South Indian", icon: "🥘", count: "10 restaurants" }
  ];

  const routes = {
    "/": { title: "Home — FoodieHub", init: initHome },
    "/restaurants": { title: "Restaurants — FoodieHub", init: initRestaurants },
    "/categories": { title: "Categories — FoodieHub", init: initCategories },
    "/favorites": { title: "Favorites — FoodieHub", init: initFavorites },
    "/profile": { title: "Profile — FoodieHub", init: initProfile },
    "/about": { title: "About — FoodieHub", init: initAbout }
  };

  function isLoggedIn() {
    return localStorage.getItem("foodiehub_user") !== null;
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem("foodiehub_user")) || null; }
    catch { return null; }
  }

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem("foodiehub_favorites")) || []; }
    catch { return []; }
  }

  function saveFavorites(ids) {
    localStorage.setItem("foodiehub_favorites", JSON.stringify(ids));
    updateFavoriteCount();
  }

  function isFavorite(id) {
    return getFavorites().includes(Number(id));
  }

  function toggleFavorite(id) {
    const numericId = Number(id);
    const favorites = getFavorites();
    const next = favorites.includes(numericId)
      ? favorites.filter(item => item !== numericId)
      : [...favorites, numericId];
    saveFavorites(next);
    return next.includes(numericId);
  }

  function getTemplate(name) {
    return document.getElementById(name);
  }

  function showTemplate(name, target = app) {
    const template = getTemplate(name);
    if (!template) return false;
    target.replaceChildren(template.content.cloneNode(true));
    return true;
  }

  function getLocalPath() {
    if (window.location.protocol === "file:") {
      const hash = window.location.hash.replace(/^#/, "");
      return hash.startsWith("/") ? hash : "/";
    }
    const pathname = window.location.pathname;
    const clean = pathname.replace(/\/index\.html$/, "") || "/";
    // Support static hosting inside a subfolder such as /FoodieHub/
    const segments = clean.split("/").filter(Boolean);
    const first = segments[0];
    if (first && !routes["/" + segments.slice(1).join("/")]) {
      const possible = "/" + segments.slice(1).join("/");
      if (routes[possible] || possible.startsWith("/restaurant/")) return possible;
    }
    return clean;
  }

  function routeUrl(path) {
    if (window.location.protocol === "file:") return "#" + (path || "/");
    return path === "/" ? "./" : path;
  }

  function updateUrl(path, replace = false) {
    if (window.location.protocol === "file:") {
      const url = "#" + (path || "/");
      if (replace) history.replaceState({ path }, "", url);
      else history.pushState({ path }, "", url);
      return;
    }
    const url = path === "/" ? "/" : path;
    if (replace) history.replaceState({ path }, "", url);
    else history.pushState({ path }, "", url);
  }

  function setActiveLink(path) {
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.path === path || (path.startsWith("/restaurant/") && link.dataset.path === "/restaurants"));
    });
  }

  function render(path, animate = true) {
    if (!isLoggedIn()) {
      renderLogin();
      return;
    }

    shell.classList.remove("hidden");
    authScreen.innerHTML = "";

    const route = routes[path];
    if (!route) {
      if (path.startsWith("/restaurant/")) {
        const id = Number(path.split("/")[2]);
        if (restaurants.some(r => r.id === id)) {
          renderRestaurant(id, animate);
          return;
        }
      }
      render404(path, animate);
      return;
    }

    if (!showTemplate(route.template || route.view || ("view-" + path.slice(1)))) {
      // Routes use direct template names below.
      const templateMap = { "/": "view-home", "/restaurants": "view-restaurants", "/categories": "view-categories", "/favorites": "view-favorites", "/profile": "view-profile", "/about": "view-about" };
      showTemplate(templateMap[path]);
    }

    document.title = route.title;
    setActiveLink(path);
    closeMobileMenu();
    runEnterAnimation(animate);
    if (typeof route.init === "function") route.init();
  }

  function renderLogin() {
    shell.classList.add("hidden");
    showTemplate("view-login", authScreen);
    document.title = "Login — FoodieHub";
    const form = document.getElementById("login-form");
    const error = document.getElementById("login-error");
    form.addEventListener("submit", event => {
      event.preventDefault();
      const name = document.getElementById("login-name").value.trim();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      if (name.length < 2 || !email.includes("@") || password.length < 4) {
        error.textContent = "Please enter a valid name, email and password (4+ characters).";
        return;
      }
      localStorage.setItem("foodiehub_user", JSON.stringify({ name, email }));
      updateUrl("/", true);
      render("/");
    });
  }

  function render404(path, animate) {
    showTemplate("view-404");
    document.getElementById("bad-path").textContent = path;
    document.title = "404 — FoodieHub";
    setActiveLink(null);
    closeMobileMenu();
    runEnterAnimation(animate);
  }

  function renderRestaurant(id, animate) {
    const restaurant = restaurants.find(r => r.id === Number(id));
    if (!restaurant) return render404("/restaurant/" + id, animate);
    showTemplate("view-restaurant");
    const target = document.getElementById("restaurant-detail");
    target.innerHTML = `
      <div class="detail-card">
        <div class="detail-hero">
          <img src="${restaurant.image}" alt="${restaurant.name}">
          <div class="detail-content">
            <p class="eyebrow">${restaurant.category} · ${restaurant.location}</p>
            <h1>${restaurant.name}</h1>
            <p class="description">${restaurant.description}</p>
            <div class="detail-tags">
              <span class="tag">⭐ ${restaurant.rating}</span>
              <span class="tag">⏱ ${restaurant.time}</span>
              <span class="tag">${restaurant.price}</span>
            </div>
            <button class="btn ${isFavorite(id) ? "btn-primary" : "btn-light"}" id="detail-favorite">${isFavorite(id) ? "♥ Saved" : "♡ Save Favorite"}</button>
            <a href="/restaurants" data-route class="btn btn-light">← Back to restaurants</a>
          </div>
        </div>
        <div class="detail-content">
          <p class="eyebrow">Popular menu</p>
          <h2>What to order</h2>
          <div class="menu-list">${restaurant.menu.map(item => `<div class="menu-item"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join("")}</div>
        </div>
      </div>
    `;
    document.title = restaurant.name + " — FoodieHub";
    setActiveLink("/restaurants");
    closeMobileMenu();
    runEnterAnimation(animate);
    document.getElementById("detail-favorite").addEventListener("click", () => {
      toggleFavorite(id);
      renderRestaurant(id, false);
    });
  }

  function runEnterAnimation(animate = true) {
    if (!animate) return;
    app.classList.remove("view-enter");
    void app.offsetWidth;
    app.classList.add("view-enter");
  }

  function navigateTo(path, options = {}) {
    if (!path.startsWith("/")) path = "/" + path;
    const current = getLocalPath();
    if (path === current && !options.force) return;

    app.classList.add("view-exit");
    updateUrl(path, options.replace || false);
    setTimeout(() => {
      render(path);
      app.classList.remove("view-exit");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, EXIT_MS);
  }

  function initHome() {
    const home = document.getElementById("home-restaurants");
    home.innerHTML = restaurants.slice(0, 3).map(restaurantCard).join("");
    document.getElementById("home-categories").innerHTML = categories.slice(0, 4).map(categoryCard).join("");
  }

  function initRestaurants() {
    const list = document.getElementById("restaurant-list");
    const filters = document.getElementById("restaurant-filters");
    const search = document.getElementById("restaurant-search");
    const filterNames = ["All", ...new Set(restaurants.map(r => r.category))];
    filters.innerHTML = filterNames.map(name => `<button type="button" class="filter-btn ${name === "All" ? "active" : ""}" data-filter="${name}">${name}</button>`).join("");
    let active = "All";

    function update() {
      const query = search.value.trim().toLowerCase();
      const filtered = restaurants.filter(r => {
        const categoryMatch = active === "All" || r.category === active;
        const searchMatch = !query || `${r.name} ${r.cuisine} ${r.location}`.toLowerCase().includes(query);
        return categoryMatch && searchMatch;
      });
      list.innerHTML = filtered.length ? filtered.map(restaurantCard).join("") : emptyState("No restaurants found.", "Try another search or category.");
    }

    filters.addEventListener("click", event => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      active = btn.dataset.filter;
      filters.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
      update();
    });
    search.addEventListener("input", update);
    update();
  }

  function initCategories() {
    const list = document.getElementById("category-list");
    const results = document.getElementById("category-results");
    list.innerHTML = categories.map(categoryCard).join("");
    list.addEventListener("click", event => {
      const item = event.target.closest("[data-category]");
      if (!item) return;
      const name = item.dataset.category;
      const found = restaurants.filter(r => r.category === name);
      results.classList.remove("hidden");
      results.innerHTML = `<h2>${name} Restaurants</h2><div class="restaurant-grid large">${found.length ? found.map(restaurantCard).join("") : emptyState("No sample restaurants in this category.", "Try another category.")}</div>`;
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function initFavorites() {
    const list = document.getElementById("favorite-list");
    const favoriteRestaurants = restaurants.filter(r => isFavorite(r.id));
    list.innerHTML = favoriteRestaurants.length
      ? favoriteRestaurants.map(restaurantCard).join("")
      : emptyState("No favorites yet.", "Tap the heart on a restaurant to save it.");
  }

  function initProfile() {
    const user = getUser();
    const card = document.getElementById("profile-card");
    const initial = user?.name?.charAt(0).toUpperCase() || "U";
    card.innerHTML = `
      <div class="profile-avatar">${initial}</div>
      <h2>${escapeHtml(user?.name || "Foodie")}</h2>
      <p>${escapeHtml(user?.email || "")}</p>
      <div class="profile-detail"><strong>Saved favorites</strong><p>${getFavorites().length} restaurant(s) saved in this browser.</p></div>
      <div class="profile-detail"><strong>Storage</strong><p>LocalStorage is being used for this frontend-only sprint demonstration.</p></div>
    `;
  }

  function initAbout() {}

  function restaurantCard(r) {
    return `
      <article class="restaurant-card">
        <div class="restaurant-image-wrap">
          <img src="${r.image}" alt="${r.name}" loading="lazy">
          <button type="button" class="favorite-btn ${isFavorite(r.id) ? "active" : ""}" data-favorite="${r.id}" aria-label="${isFavorite(r.id) ? "Remove from favorites" : "Add to favorites"}">${isFavorite(r.id) ? "♥" : "♡"}</button>
        </div>
        <div class="restaurant-body">
          <h3>${escapeHtml(r.name)}</h3>
          <div class="restaurant-meta"><span>${escapeHtml(r.cuisine)} · ${r.price}</span><span class="rating">★ ${r.rating}</span></div>
          <div class="restaurant-meta"><span>📍 ${escapeHtml(r.location)}</span><span>⏱ ${r.time}</span></div>
          <div class="card-actions">
            <a href="/restaurant/${r.id}" data-route class="small-btn">View details</a>
            <span class="restaurant-meta">Popular</span>
          </div>
        </div>
      </article>
    `;
  }

  function categoryCard(c) {
    return `<a href="#" class="category-item" data-category="${escapeHtml(c.name)}"><div class="category-icon">${c.icon}</div><h3>${escapeHtml(c.name)}</h3><p>${c.count}</p></a>`;
  }

  function emptyState(title, message) {
    return `<div class="empty-state"><div style="font-size:2rem">🍽️</div><h3>${title}</h3><p>${message}</p><a href="/restaurants" data-route class="btn btn-light">Browse Restaurants</a></div>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function updateFavoriteCount() {
    const count = document.getElementById("favorite-count");
    if (count) count.textContent = getFavorites().length;
  }

  function closeMobileMenu() {
    navLinks?.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
  }

  // Delegated routing and favorite handling.
  document.addEventListener("click", event => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) {
      event.preventDefault();
      const id = favorite.dataset.favorite;
      toggleFavorite(id);
      favorite.classList.toggle("active", isFavorite(id));
      favorite.textContent = isFavorite(id) ? "♥" : "♡";
      favorite.setAttribute("aria-label", isFavorite(id) ? "Remove from favorites" : "Add to favorites");
      return;
    }

    const category = event.target.closest("[data-category]");
    if (category && category.getAttribute("href") === "#") {
      event.preventDefault();
      return;
    }

    const link = event.target.closest("a[data-route]");
    if (!link) return;
    event.preventDefault();
    const url = new URL(link.href, window.location.href);
    let path = url.pathname;
    if (window.location.protocol === "file:") {
      path = (link.getAttribute("href") || "#/").replace(/^#/, "").split("?")[0] || "/";
    }
    navigateTo(path);
  });

  hamburger?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(open));
  });

  document.getElementById("profile-button")?.addEventListener("click", () => navigateTo("/profile"));

  document.getElementById("logout-button")?.addEventListener("click", () => {
    localStorage.removeItem("foodiehub_user");
    localStorage.removeItem("foodiehub_favorites");
    updateUrl("/", true);
    renderLogin();
  });

  window.addEventListener("popstate", () => {
    render(getLocalPath());
  });

  // Hash fallback is required for file:// local previews.
  window.addEventListener("hashchange", () => {
    if (window.location.protocol === "file:") render(getLocalPath());
  });

  // Initial boot.
  if (!isLoggedIn()) {
    renderLogin();
  } else {
    const initialPath = getLocalPath();
    render(initialPath, false);
    updateFavoriteCount();
  }
})();
